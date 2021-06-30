import {getBffUrlConfig} from "../../../utils/Configs";
import {CORRELATION_ID_HEADER, NOT_APPLICABLE_LABEL} from "../../../constants/Constants";
import { HTTP_NOT_FOUND_ERROR } from "../../../constants/Errors";

export const DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_OFFSET = 0;

const handleResponse = (response, pZRContext) => {
    const correlationId = response.headers.get(CORRELATION_ID_HEADER) || NOT_APPLICABLE_LABEL;
    return response.json().then((json) => {
        if (response.ok) {
            const data = json.data;
            const itemPriceZoneArrayLength = data && data.item_price_zones ? (data.item_price_zones).length : 0;
            if (itemPriceZoneArrayLength > 0) {
                pZRContext.setIsResponseEmpty(true);
            }
            return {success: true, data: json, headers: {[CORRELATION_ID_HEADER]: correlationId}};
        }
        return {success: false, data: json, headers: {[CORRELATION_ID_HEADER]: correlationId}, httpStatus: response.status};
    });
};

const formRequestBody = (requestData) => {
    return JSON.stringify({
        // business_unit_number: requestData.opcoId,
        business_unit_number: '019', //TODO: test purpose only, remove this
        item_attribute_group_id: requestData.attributeGroupId,
        customer_account: requestData.customer ? requestData.customer : null,
        customer_group_id: requestData.customerGroup ? requestData.customerGroup : null,
        offset: requestData.offset ? requestData.offset : DEFAULT_OFFSET,
        limit: requestData.limit ? requestData.limit : DEFAULT_PAGE_SIZE,
    });
};

export const PZRFetchSearchResults = (requestData, pZRContext) => {

    pZRContext.setSearchTableLoading(true);
    fetch(getBffUrlConfig().priceZoneReassignmentSearchUrl, {
        method: 'POST',
        body: formRequestBody(requestData),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then((response) => handleResponse(response, pZRContext))
        .then((resp) => {
            pZRContext.setIsResponseEmpty(false);
            if (resp.success) {
                pZRContext.setSearchResults({...resp.data, correlationId: resp.headers[CORRELATION_ID_HEADER]});
            } else {
                pZRContext.setErrorData({...resp.data, correlationId: resp.headers[CORRELATION_ID_HEADER], httpStatus: resp.httpStatus});
            }
            return null;
        })
        .catch((e) => {
            pZRContext.setErrorData(e);
        })
        .finally(() => {
            pZRContext.setSearchLoading(false);
            pZRContext.setSearchTableLoading(false);
        });
};
