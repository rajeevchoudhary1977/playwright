import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import { errorHandler, error404 } from './app/middlewares/asyncHandler.middlewares.js';
import { MONGO_URI, PORT } from './app/configs/config.js';

import userRoute from './app/routes/user.route.js';
import webRoute from './app/routes/web.route.js';
import viewRoute from './app/routes/view.route.js';

//Initialize App
const app = express();

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  exposedHeaders: 'x-access-token',
};

corsOptions.credentials = true;
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'build'), { index: false }));

mongoose.connect(
  MONGO_URI,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log('Connected to MongoDB');
  },
);

// Insert routes here
app.use('/api/user', userRoute);
app.use("/api/webapp", webRoute);
app.use("/views", viewRoute);

// app.get("/api/generate-report", async (req, res) => {
//   const sampleTestPath = path.join(
//     __dirname,
//     "./public/assets/sample-test"
//   );

//   try {
//     const { stdout, stderr } = await execAsync(`npx playwright test`, { cwd: sampleTestPath });
    
//     if(stdout) console.log("Stdout", stdout);
//     if(stderr) console.log("stderr", stderr);
    
//     return res.json({
//       isSuccess: true,
//       msg: "Report generated in backend!!!"
//     });
//   } catch(err) {
//     console.log("Error", err);
//     return res.json({
//       isSuccess: false,
//       msg: "Error in backend"
//     });
//   }

// });

// app.get('*', (req, res) => {
//   const pathToIndex = path.join(__dirname, 'build', 'index.html');
//   return res.sendFile(pathToIndex);
// });

app.get('*', (req, res) => {
  const pathToIndex = path.join(__dirname, 'build', 'index.html');
  return res.sendFile(pathToIndex);
});

app.use(errorHandler);
app.use(error404);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});