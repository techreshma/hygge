
module.exports = {
    //------------------------ SuperAdmin User ------------------------
    register : ({ statusCode : 200  , success : true , message   : 'sub admin added successfully'}),
    exits    : ({statusCode  : 403  , success : false , message : 'user already exits...'}),
    superAdminExits : ({statusCode  : 403  , success : false , message : 'superAdmin already exits...'}),
    
    //------------------------ catch err ------------------------

    err:({ statusCode  : 400 , success:false,message: 'bad request'})	
};