import path from 'path'
import cors from 'cors'
import express from 'express'
import createRouter from 'express-file-routing'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import 'module-alias/register'
import { setupMorganLogger, displayStartupBanner } from '@/tools/logger'

const main = async () => {
    process.title = 'ivendor-superapps-api'
    process.env.TZ = 'Asia/Jakarta';

    dotenv.config();

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
    app.use(setupMorganLogger());

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

    const port = process.env.PORT || 1933;
    const env = process.env.NODE_ENV || 'development';

    app.listen(port, () => {
        displayStartupBanner(port, env);
    });
};

main();
