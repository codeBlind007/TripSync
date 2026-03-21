import joi from 'joi';

export const createTripValidation = (req, res, next) => {
    const { title, description, startDate, endDate, destination } = req.body;
    const schema = joi.object({
        title: joi.string().required().min(10).max(50).messages({
            "string.base": "Title must be a string",
            "string.empty" : "Title is required",
            "string.min" : "Title must be 10 characters long",
            "string.max" : "Title must not be more than 30 characters"
        }),

        description: joi.string().max(150).messages({
            "string.base": "Description must be a string",
            "string.max" : "description must not be more than 150 characters",
        }),

        startDate: joi.date().required().messages({
            "date.base": "Start date must be a valid date",
            "date.empty" : "Start date is required",
        }),

        endDate: joi.date().required().greater(joi.ref('startDate')).messages({
            "date.base": "End date must be a valid date",
            "date.empty" : "End date is required",
            "date.greater" : "End date must be greater than start date"
        }),

        destination: joi.array().items(joi.string().required().min(3)).min(1).messages({
            "array.base": "Destination must be an array of strings",
            "array.min" : "At least one destination is required",   
            "string.base": "Each destination must be a string",
            "string.empty" : "Destination cannot be empty",
            "string.min" : "Each destination must be at least 3 characters long"
        })
    });

    const {error, value} = schema.validate({ title, description, startDate, endDate, destination });
    if(error){
        return res.status(400).json({ error: error.details[0].message });
    }

    console.log(value);

    value.title = value.title.trim();
    value.description = value.description.trim();
    value.destination = value.destination.map(dest => dest.trim());

    value.title = value.title[0].toUpperCase() + value.title.slice(1);
    value.description = value.description[0].toUpperCase() + value.description.slice(1);
    value.destination = value.destination.map(dest => dest[0].toUpperCase() + dest.slice(1));

    console.log("Transformed Value: ", value);

    req.validatedData = value;
    next();
}