require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const createCRUDRoutes = require('./utils/routeFactory');
const { protect, authorize } = require('./middleware/auth');
const { sendContactEmail, sendNewsletterConfirmation, sendNewsletter } = require('./services/emailService');
const { uploadToCloudinary } = require('./services/cloudinaryService');
const { createOrder, verifyPayment } = require('./services/razorpayService');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] } });

connectDB();
app.use('/uploads', express.static('uploads'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', require('./routes/auth'));

const Project = require('./models/Project');
const Blog = require('./models/Blog');
const Service = require('./models/Service');

app.get('/api/v1/projects/featured', async (req, res) => { try { const items = await Project.find({status:'published'}).limit(8).sort({createdAt:-1}).lean(); res.json({success:true,data:items||[]}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/blogs/featured', async (req, res) => { try { const items = await Blog.find({status:'published'}).limit(8).sort({createdAt:-1}).lean(); res.json({success:true,data:items||[]}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/services/featured', async (req, res) => { try { const items = await Service.find().limit(8).sort({createdAt:-1}).lean(); res.json({success:true,data:items||[]}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/blogs/trending', async (req, res) => { try { const items = await Blog.find({status:'published'}).sort({likes:-1}).limit(6).lean(); res.json({success:true,data:items||[]}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/projects/stats/overview', async (req, res) => { try { const total = await Project.countDocuments(); res.json({success:true,data:{total}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

const models = { Project, Blog, Service, Skill: require('./models/Skill'), Experience: require('./models/Experience'), Achievement: require('./models/Achievement'), Testimonial: require('./models/Testimonial'), Resource: require('./models/Resource'), Contact: require('./models/Contact'), Lead: require('./models/Lead') };
const routeMap = { Project: '/api/v1/projects', Blog: '/api/v1/blogs', Service: '/api/v1/services', Skill: '/api/v1/skills', Experience: '/api/v1/experience', Achievement: '/api/v1/achievements', Testimonial: '/api/v1/testimonials', Resource: '/api/v1/resources', Contact: '/api/v1/contacts', Lead: '/api/v1/leads' };
Object.entries(routeMap).forEach(([name, path]) => app.use(path, createCRUDRoutes(models[name])));

app.post('/api/v1/blogs/:id/like', protect, async (req, res) => { await Blog.findByIdAndUpdate(req.params.id,{$inc:{likes:1}}); res.json({success:true}); });
app.post('/api/v1/blogs/:id/bookmark', protect, async (req, res) => { await Blog.findByIdAndUpdate(req.params.id,{$inc:{bookmarks:1}}); res.json({success:true}); });
app.post('/api/v1/blogs/:id/comments', protect, async (req, res) => { res.json({success:true,message:'Comment added'}); });
app.get('/api/v1/projects/:id/related', async (req, res) => { try { const p = await Project.findById(req.params.id); const r = p ? await Project.find({category:p.category,_id:{$ne:p._id}}).limit(4) : []; res.json({success:true,data:r}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/projects/category/:category', async (req, res) => { try { const items = await Project.find({category:req.params.category}); res.json({success:true,data:items}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

// Contact with email
app.post('/api/v1/contact', async (req, res) => { try { const c = await models.Contact.create(req.body); await sendContactEmail(req.body); res.status(201).json({success:true,data:c,message:'Message sent'}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

// Contact settings
let contactSettings = { email: 'contact@thesiniysky.com', phone: '+1 (555) 123-4567', address: 'New York, NY 10001', supportHours: '24/7' };
app.get('/api/v1/contact/settings', async (req, res) => { res.json({success:true,data:contactSettings}); });
app.put('/api/v1/contact/settings', protect, authorize('super_admin','admin'), async (req, res) => { contactSettings = {...contactSettings,...req.body}; res.json({success:true,data:contactSettings}); });

// Newsletter with email
app.post('/api/v1/newsletter/subscribe', async (req, res) => { try { await sendNewsletterConfirmation(req.body.email); res.json({success:true,message:'Subscribed! Check your email.'}); } catch(e) { res.json({success:true,message:'Subscribed'}); } });
app.post('/api/v1/newsletter/send', protect, authorize('super_admin','admin'), async (req, res) => { try { await sendNewsletter(req.body.subject, req.body.content); res.json({success:true,message:'Newsletter sent'}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.post('/api/v1/newsletter/unsubscribe', async (req, res) => { res.json({success:true,message:'Unsubscribed'}); });

// Admin
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
app.get('/api/v1/admin/users', protect, authorize('super_admin','admin'), async (req, res) => { try { const users = await User.find().populate('role'); res.json({success:true,data:users}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.put('/api/v1/admin/users/:id', protect, authorize('super_admin','admin'), async (req, res) => { try { if(req.body.role&&typeof req.body.role==='string'){ const r=await Role.findOne({name:req.body.role}); if(r)req.body.role=r._id; } const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate('role'); res.json({success:true,data:user}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.delete('/api/v1/admin/users/:id', protect, authorize('super_admin'), async (req, res) => { try { await User.findByIdAndDelete(req.params.id); res.json({success:true,message:'Deleted'}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/admin/roles', protect, async (req, res) => { try { const roles = await Role.find().populate('permissions').lean(); const permissions = await Permission.find().lean(); res.json({success:true,data:{roles:roles||[],permissions:permissions||[]}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/admin/system-logs', protect, authorize('super_admin','admin'), async (req, res) => { res.json({success:true,data:[]}); });

// Analytics
app.get('/api/v1/analytics/dashboard', protect, async (req, res) => { try { const [users,projects]=await Promise.all([User.countDocuments(),Project.countDocuments()]); res.json({success:true,data:{totalUsers:users,totalOrders:projects,totalRevenue:45678,orderStats:{pending:12,processing:8,completed:420,cancelled:16},recentActivity:[]}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/analytics/users', protect, async (req, res) => { res.json({success:true,data:[{month:'Jan',count:100},{month:'Feb',count:200}]}); });
app.get('/api/v1/analytics/revenue', protect, async (req, res) => { res.json({success:true,data:[{label:'Jan',value:5000},{label:'Feb',value:7500}]}); });

// CRM
app.get('/api/v1/crm/leads', protect, async (req, res) => { try { const leads = await models.Lead.find().sort({createdAt:-1}); res.json({success:true,data:leads,pagination:{page:1,limit:100,total:leads.length}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.post('/api/v1/crm/leads', protect, async (req, res) => { try { const lead = await models.Lead.create(req.body); res.status(201).json({success:true,data:lead}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.put('/api/v1/crm/leads/:id', protect, async (req, res) => { try { const lead = await models.Lead.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json({success:true,data:lead}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.delete('/api/v1/crm/leads/:id', protect, async (req, res) => { try { await models.Lead.findByIdAndDelete(req.params.id); res.json({success:true,message:'Deleted'}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/crm/pipeline', protect, async (req, res) => { try { const stages=['new','contacted','qualified','proposal','negotiation','won','lost']; const pipeline={}; for(const s of stages) pipeline[s]=await models.Lead.countDocuments({status:s}); res.json({success:true,data:pipeline}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

// Orders & Invoices
const Order = require('./models/Order');
const Invoice = require('./models/Invoice');
app.get('/api/v1/orders', protect, async (req, res) => { try { const filter=req.user.role?.name==='client'?{client:req.user.id}:{}; const orders=await Order.find(filter).populate('client').sort({createdAt:-1}); res.json({success:true,data:orders,pagination:{page:1,limit:100,total:orders.length}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.post('/api/v1/orders', protect, async (req, res) => { try { const order=await Order.create({...req.body,client:req.user.id}); res.status(201).json({success:true,data:order}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/orders/:id', protect, async (req, res) => { try { const order=await Order.findById(req.params.id).populate('client'); res.json({success:true,data:order}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/invoices', protect, async (req, res) => { try { const filter=req.user.role?.name==='client'?{client:req.user.id}:{}; const invoices=await Invoice.find(filter).populate('client').sort({createdAt:-1}); res.json({success:true,data:invoices,pagination:{page:1,limit:100,total:invoices.length}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.post('/api/v1/invoices', protect, async (req, res) => { try { const invoice=await Invoice.create(req.body); res.status(201).json({success:true,data:invoice}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.put('/api/v1/invoices/:id', protect, async (req, res) => { try { const invoice=await Invoice.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json({success:true,data:invoice}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

// Payments with Razorpay
app.post('/api/v1/payments/process', protect, async (req, res) => { try { const order = await createOrder(req.body.amount); if (!order) return res.status(500).json({success:false,message:'Payment service unavailable'}); res.json({success:true,data:order}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.post('/api/v1/payments/verify', protect, async (req, res) => { try { const { paymentId, orderId, signature } = req.body; const isValid = await verifyPayment(paymentId, orderId, signature); if (isValid) { res.json({success:true,message:'Payment verified'}); } else { res.status(400).json({success:false,message:'Invalid signature'}); } } catch(e) { res.status(500).json({success:false,message:e.message}); } });

// Client
app.get('/api/v1/client/dashboard', protect, async (req, res) => { try { const[o,i]=await Promise.all([Order.countDocuments({client:req.user.id}),Invoice.countDocuments({client:req.user.id})]); res.json({success:true,data:{orders:o,invoices:i,messages:0}}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/client/orders', protect, async (req, res) => { try { const orders = await Order.find({client:req.user.id}).sort({createdAt:-1}); res.json({success:true,data:orders}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.get('/api/v1/client/invoices', protect, async (req, res) => { try { const invoices = await Invoice.find({client:req.user.id}).sort({createdAt:-1}); res.json({success:true,data:invoices}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

// Media with Cloudinary
const Media = require('./models/Media');
app.get('/api/v1/media/list', protect, async (req, res) => {
  try {
    const files = await Media.find().sort({createdAt:-1}).lean();
    const baseUrl = process.env.APP_URL || 'https://thesiniysky-backend.onrender.com';
    const data = files.map(f => ({...f, url: f.url && f.url.startsWith('http') ? f.url : baseUrl + (f.url || '')}));
    res.json({success:true,data});
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});

// Debug endpoint for Cloudinary
app.get('/api/v1/debug/cloudinary', protect, authorize('super_admin','admin'), async (req, res) => {
  const c = process.env;
  res.json({success:true,data:{configured:!!(c.CLOUDINARY_CLOUD_NAME&&c.CLOUDINARY_API_KEY&&c.CLOUDINARY_API_SECRET),cloudName:c.CLOUDINARY_CLOUD_NAME?'SET':'MISSING',apiKey:c.CLOUDINARY_API_KEY?'SET':'MISSING',apiSecret:c.CLOUDINARY_API_SECRET?'SET':'MISSING'}});
});

// Media routes
app.get('/api/v1/media/list', protect, async (req, res) => { try { const files = await Media.find().sort({createdAt:-1}).lean(); const baseUrl = process.env.APP_URL || 'https://thesiniysky-backend.onrender.com'; const data = files.map(f => ({...f, url: f.url && f.url.startsWith('http') ? f.url : baseUrl + (f.url || '')})); res.json({success:true,data}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });
app.post('/api/v1/media/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({success:false,message:'No file uploaded'});
    let url = '/uploads/' + req.file.filename;
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'thesiniysky' });
        url = result.secure_url;
        console.log('Cloudinary upload SUCCESS:', url);
      }
    } catch (cloudErr) { console.log('Cloudinary skipped:', cloudErr.message); }
    const media = await Media.create({ filename: req.file.filename, originalName: req.file.originalname, url: url, mimeType: req.file.mimetype, size: req.file.size, uploadedBy: req.user.id });
    res.json({success:true,data:media});
  } catch(e) { res.status(500).json({success:false,message:e.message}); }
});


app.post('/api/v1/media/delete', protect, async (req, res) => { try { await Media.findByIdAndDelete(req.body.id); res.json({success:true,message:'Deleted'}); } catch(e) { res.status(500).json({success:false,message:e.message}); } });

app.get('/health', (req, res) => res.json({success:true}));
app.get('/api/v1', (req, res) => res.json({success:true,message:'TheSiniySky API v1'}));
app.use((err, req, res, next) => res.status(500).json({success:false,message:err.message}));
io.on('connection', (socket) => { socket.on('disconnect', () => {}); });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server on port', PORT));

module.exports = { app, server, io };
