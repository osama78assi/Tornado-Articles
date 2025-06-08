// To make API errors more managble throw application it's a good idea to use error CODES
// That not just will help me in front-end for detection errors and make even more readable error images
// But also make my API more maintainable and scalable. This this the ranges I used to make error codes

//  Code Range  | Purpose                  
//  ----------- | ------------------------ 
//   1000–1099  | Authentication errors    
//   1100–1199  | User-related errors      
//   1200–1299  | Validation errors        
//   1300–1399  | Permission/Access errors 
//   1400–1499  | Resource-specific errors 
//   5000–5999  | Internal server errors   

// Putting only errors codes here make it very flexible to update

const ERROR_CODES = {
    // Authentication errors

    // User-related errors

    // Validation errors

    // Permission/Access errors

    // Interal server erros
};

module.exports = ERROR_CODES;