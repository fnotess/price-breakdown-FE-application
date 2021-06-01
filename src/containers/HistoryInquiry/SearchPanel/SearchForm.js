import React, { useContext } from "react";
import moment from "moment";
import { Form, Input, Checkbox, Select, InputNumber, DatePicker } from "antd";
import { PriceValidationContext } from "../../PriceValidation/PriceValidationContext";
import { UserDetailContext } from "../../UserDetailContext";
import { getBusinessUnits } from "../../PriceValidation/PricingHelper";
import { getBffUrlConfig } from "../../../utils/Configs";

import {
  CORRELATION_ID_HEADER,
  NOT_APPLICABLE_LABEL,
  ORDER_PRICE_TYPE_HAND,
  MAX_VALUE_ALLOWED_FOR_HAND_PRICE_INPUT,
} from "../../../constants/Constants";

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: "${label} is required!",
  types: {
    number: "${label} is not a valid number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

const initialValues = { quantity: 1, date: moment(), split: false };

const formRequestBody = (requestData) => {
  const product = {
    supc: `${requestData.supc}`,
    splitFlag: !!requestData.split,
  };

  if (requestData.handPrice) {
    product.orderPrice = requestData.handPrice;
    product.orderPriceType = ORDER_PRICE_TYPE_HAND;
  }

  return JSON.stringify({
    businessUnitNumber: requestData.site,
    customerAccount: requestData.customer,
    priceRequestDate: requestData.date.format("YYYYMMDD"),
    requestedQuantity: requestData.quantity,
    product,
  });
};

const SearchForm = () => {
  const priceValidationContext = useContext(PriceValidationContext);
  const userDetailContext = useContext(UserDetailContext);
  const {
    userDetails: { businessUnitMap = new Map() },
  } = userDetailContext.userDetailsData;

  const handleResponse = (response) => {
    const correlationId =
      response.headers.get(CORRELATION_ID_HEADER) || NOT_APPLICABLE_LABEL;
    return response.json().then((json) => {
      if (response.ok) {
        return {
          success: true,
          data: json,
          headers: { [CORRELATION_ID_HEADER]: correlationId },
        };
      }
      return {
        success: false,
        data: json,
        headers: { [CORRELATION_ID_HEADER]: correlationId },
      };
    });
  };

  const priceRequestHandler = (requestData) => {
    fetch(getBffUrlConfig().priceDataEndpoint, {
      method: "POST",
      body: formRequestBody(requestData),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(handleResponse)
      .then((resp) => {
        if (resp.success) {
          priceValidationContext.setPriceData({
            ...resp.data,
            correlationId: resp.headers[CORRELATION_ID_HEADER],
          });
        } else {
          priceValidationContext.setErrorData({
            ...resp.data,
            correlationId: resp.headers[CORRELATION_ID_HEADER],
          });
        }

        return null;
      })
      .catch((e) => {
        priceValidationContext.setErrorData(e);
      });
  };

  const onSubmit = (values) => {
    priceValidationContext.setIsLoading(true);
    priceValidationContext.setResponse(null);
    return priceRequestHandler(values);
  };

  return (
    <>
      <div className="panel-header">
        <i className="icon fi flaticon-list" />
        Search
      </div>
      <div className="search-form">
        <Form
          name="nest-messages"
          onFinish={onSubmit}
          validateMessages={validateMessages}
          initialValues={initialValues}
        >
          <Form.Item
            name="OpCo"
            label="OpCo"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              placeholder="Select Site"
              dropdownMatchSelectWidth={false}
              filterOption={(inputValue, option) => {
                if (inputValue && option.children) {
                  // unless the backslash is escaped, this will end up with a syntax error
                  const pattern = inputValue.replace(/\\/g, "").toLowerCase();
                  if (
                    inputValue.length !== pattern.length ||
                    inputValue.match(/[^A-Za-z0-9 -]/)
                  ) {
                    return false;
                  }
                  return option.children.join("").toLowerCase().match(pattern);
                }
                return true;
              }}
              showSearch
            >
              {getBusinessUnits(businessUnitMap)}
            </Select>
          </Form.Item>
          <Form.Item
            name="customer"
            label="Customer"
            rules={[
              {
                pattern: "^[a-zA-Z0-9]+$",
                message: "Not a valid Customer ID",
              },
              {
                required: true,
              },
              {
                max: 14,
                message: "Should be 14 characters max",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="supc"
            label="Item #"
            rules={[
              {
                pattern: "^[0-9]+$",
                message: "Not a valid Item ID",
              },
              {
                required: true,
              },
              {
                max: 9,
                message: "Should be 9 characters max",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* new date fields */}

          <Form.Item
            name="date"
            label="Date"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <div className="inq-dates-wrapper">
              <DatePicker />
              <br/>
              <DatePicker />
            </div>
          </Form.Item>

          <Form.Item name="split" label="Split" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item className="search-btn-wrapper">
            <button
              type="primary"
              htmlType="submit"
              className="search-btn outlined-btn"
            >
              Search
            </button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SearchForm;
