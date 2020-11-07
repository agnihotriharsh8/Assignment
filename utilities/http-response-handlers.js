const statusCodes = {
    BadRequest: 400,
    NotFound: 404,
    Unauthorized: 401,
    Ok: 200,
    InternalServerError: 500
};

const statusMessages = {
    400: 'Please check the request payloads, resource you are looking is not available currently',
    404: 'resource you are looking for has been changed or not found',
    401: "you are not authorized to access the resource",
    200: "completed successfully",
    500: 'Internal server error! please try again after some time!'
};

const HttpResponse = {}
const Response = function (requestStatus, data, error) {
    return function (req, res, previousData = false) {
        if (previousData === true)
            return {requestStatus, data, error};
        let message = error ? error.message || error._message || statusMessages[requestStatus] : statusMessages[requestStatus];
        res.status(requestStatus).json({data, message, error})
    };
};

HttpResponse.Ok = (data) => {
    return Response(statusCodes.Ok, data, undefined)
};
HttpResponse.BadRequest = (error) => {
    return Response(statusCodes.BadRequest, undefined, error)
};
HttpResponse.NotFound = (error) => {
    return Response(statusCodes.NotFound, undefined, error)
};
HttpResponse.UnAuthorized = (data, error) => {
    return Response(statusCodes.Unauthorized, data, error)
};
HttpResponse.ServerError = (data, error) => {
    return Response(statusCodes.InternalServerError, data, error)
};
module.exports = HttpResponse;
