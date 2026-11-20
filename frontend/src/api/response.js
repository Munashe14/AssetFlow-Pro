export function expectArrayResponse(response, resource) {
    if (!Array.isArray(response.data)) {
        throw new Error(`${resource} API response was not a list.`);
    }

    return response;
}
