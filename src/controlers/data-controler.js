const {sendResponse,formatHTTPResponse} = require('../utils');
const Joi = require('@hapi/joi');


module.exports = async (app) => {
    const Data = app.get("Data");
    app.use('/login', async (req, res, next) => {
        if (['POST','PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            sendResponse(res, 'Method not allowed', 405);
            return;
        }
        next();
    });

    app.get('/data', async (req, res) => {
        // We use JOI to validate the request body
        const schema = Joi.object({
            // firstObjectType, firstFieldId, secondaryObjectType, month, year
            firstObjectType: Joi.string().max(127).required(),
            firstFieldId: Joi.string().max(127).required(),
            secondaryObjectType: Joi.string().max(127).required(),
            month: Joi.number().min(1).max(12).required(),
            year: Joi.number().min(1970).max(3000).required()
        });
        const { error } = schema.validate(req.body);
        if (error) {
            sendResponse(res, error.details[0].message, 400);
            return;
        }
        let result = await Data.get_item_timesheet(req.body.firstObjectType, req.body.firstFieldId, req.body.secondaryObjectType, req.body.month, req.body.year);
        result = formatHTTPResponse(result);
        if (result.status === "error") {
            sendResponse(res, result.message, 500);
            return;
        }
        sendResponse(res,result.result, 200);
    }
    );
}


