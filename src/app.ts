import path from 'path'
import cors from 'cors'
import express, { json, urlencoded } from 'express'
import createRouter, { router } from 'express-file-routing'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import morgan from 'morgan'
import 'module-alias/register'

const main = async () => {
    process.env.TZ = 'Asia/Jakarta';
    console.log(new Date().toString());

    dotenv.config();

    const PORT = process.env.PORT || 1933
    
    const app = express();

    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
        if (req.method == 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(fileUpload());
    app.use(morgan('dev'));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use('/uploads', express.static(path.join('//192.168.1.122/others/MTSpeed/Evendor/uploads/vendorDocuments/')));

    const router = express.Router();

    let bodyParser = require('body-parser');

    app.use(
        bodyParser.json({
            limit: '50mb',
        })
    );

    app.use(
        bodyParser.urlencoded({
            limit: '50mb',
            extended: true,
            parameterLimit: 50000,
        })
    );

    await createRouter(router, {
        directory: path.join(__dirname, 'routes'),
    });

    app.use('/api', router);

    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}/api`);
    });
};

main();
