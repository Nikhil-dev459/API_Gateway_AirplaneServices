const express=require('express');
const morgan=require('morgan');
const {createProxyMiddleware}=require('http-proxy-middleware');
const rateLimit=require('express-rate-limit');
const axios=require('axios');

const {serverConfig}=require('./config');
const apiRoutes=require('./routes');

const app=express();

const limiter=rateLimit({
    windowMs:2*60*1000,
    max:5
})

app.use('/api',apiRoutes);
app.use(morgan('combined'));
app.use(limiter);

app.use('/bookingservice',async(req,res,next)=>{
    try{
        console.log(req.headers['x-access-token']);
        const response=await axios.get('http://localhost:3001/api/v1/isAuthenticated',{
            headers:{
                'x-access-token':req.headers['x-access-token']
            }
        });
        console.log(response.data); 
        if(response.data.success){
            next();
        }
        else{
            return res.status(401).json({
                message:'Unauthorised'
            });
        }
    }
    catch(error){
        return res.status(401).json({
            message:'Unauthorised'
        }); 
    }
})
app.use('/bookingservice',createProxyMiddleware({target:'http://localhost:4000/',changeOrigin:true}));

app.get('/home',(req,res)=>{
    return res.json({message:'OK'});
});

app.listen(serverConfig.PORT,()=>{
    console.log(`Successfully started the server on PORT : ${serverConfig.PORT}`);
    //Logger.info("Successfully started the server","root",{});
});