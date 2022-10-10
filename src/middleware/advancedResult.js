const advancedResult = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query to not to change the query
    const reqQuery = { ...req.query };
    
    // Exclude fields when filtering with find() cuz they're not a field in db
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    
    excludeFields.forEach(field => delete reqQuery[field]);

    // Create query string 
    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Find method to find the document with the specified condition
    query = model.find(JSON.parse(queryStr));

    // Select fields: mongoose needs a string of select fields seperated by spaces
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');

        // Select method of mongoose to get a certain fields of documents. E.g. select('name age') 
        query = query.select(fields);
    }

    // Sort fields
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');

        // Sort fields ascending when not prefix with -
        query = query.sort(sortBy);
    } else {
        // Sorted by create date descending by default
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // Count all documents with query (object query)
    const total = await model.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);

    // Check when we pass an object for populate, add populate to query
    if(populate) {
        query = query.populate(populate);
    }
    
    const results = await query;

    // Pagination result
    const pagination = {};

    if(endIndex < total && Math.ceil(total / limit) >= page) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if(startIndex > 0 && Math.ceil(total / limit) >= page) {
        pagination.prev = {
            page: page - 1,
            limit,
        }
    }

    res.advancedResults = {
        success: true,
        total,
        pagination,
        data: results
    }

    next();
}

export default advancedResult;