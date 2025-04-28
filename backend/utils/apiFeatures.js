// backend/utils/apiFeatures.js
class APIFeatures {
    /**
     * Constructs APIFeatures instance.
     * @param {mongoose.Query} query - The initial Mongoose query object (e.g., Product.find()).
     * @param {object} queryStr - The query string object from the request (req.query).
     */
    constructor(query, queryStr) {
        this.query = query;         // The Mongoose query object
        this.queryStr = queryStr;   // The request query object (req.query)
    }

    /**
     * Adds search functionality based on the 'keyword' query parameter.
     * Searches the 'name' field by default using a case-insensitive regex.
     */
    search() {
        const keyword = this.queryStr.keyword ? {
            // Search in the 'name' field using regex for partial, case-insensitive matching
            // Can be extended to search other fields using $or
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i' // Case-insensitive
            }
            /* Example searching multiple fields:
            $or: [
              { name: { $regex: this.queryStr.keyword, $options: 'i' } },
              { description: { $regex: this.queryStr.keyword, $options: 'i' } },
              { category: { $regex: this.queryStr.keyword, $options: 'i' } },
            ]
            */
        } : {};

        // Apply the keyword search criteria to the Mongoose query
        this.query = this.query.find({ ...keyword });
        return this; // Return instance for chaining
    }

    /**
     * Adds filtering capabilities based on query parameters, excluding
     * reserved keywords like 'keyword', 'limit', 'page', 'sort'.
     * Handles comparison operators (gt, gte, lt, lte) for fields like price.
     */
    filter() {
        // Create a shallow copy of the query string object to modify
        const queryCopy = { ...this.queryStr };

        // Fields to exclude from filtering as they are handled by other methods
        const removeFields = ['keyword', 'limit', 'page', 'sort'];
        removeFields.forEach(el => delete queryCopy[el]);

        // --- Advanced Filtering (e.g., for price range) ---
        // Convert query object to string to replace operators
        let queryStr = JSON.stringify(queryCopy);
        // Use regex to add '$' prefix to mongo comparison operators (gt, gte, lt, lte)
        // Example query: ?price[gte]=1000&price[lte]=5000
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        // Parse the modified string back to an object and apply it to the query
        this.query = this.query.find(JSON.parse(queryStr));
        return this; // Return instance for chaining
    }

    /**
     * Adds sorting functionality based on the 'sort' query parameter.
     * Allows sorting by multiple fields (comma-separated).
     * Defaults to sorting by 'createdAt' descending if no sort param is provided.
     */
    sort() {
        if (this.queryStr.sort) {
            // Handle sorting by multiple fields: ?sort=price,-ratings
            // Mongoose expects space-separated fields for multi-sort
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default sort order if none is specified (e.g., newest first)
            this.query = this.query.sort('-createdAt');
        }
        return this; // Return instance for chaining
    }

    /**
     * Adds pagination functionality based on 'page' and a specified limit.
     * @param {number} resultsPerPage - The number of documents to show per page.
     */
    pagination(resultsPerPage) {
        // Get the current page number from query string, default to 1
        const currentPage = Number(this.queryStr.page) || 1;
        // Calculate the number of documents to skip based on current page and limit
        const skip = resultsPerPage * (currentPage - 1);

        // Apply limit (results per page) and skip (offset) to the Mongoose query
        this.query = this.query.limit(resultsPerPage).skip(skip);
        return this; // Return instance for chaining
    }
}

module.exports = APIFeatures;