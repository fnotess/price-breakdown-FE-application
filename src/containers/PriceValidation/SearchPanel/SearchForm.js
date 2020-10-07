import React, { useReducer, useContext } from "react";
import { Form, Input, Checkbox, Select, InputNumber, DatePicker } from "antd";
import businessUnits from "../../../constants/BusinessUnits";
import { PriceValidationContext } from '../PriceValidationContext'
import temp from './../../../reducers/temp'

const { Option } = Select;
const validateMessages = {
  required: "${label} is required!",
  types: {
    number: "${label} is not a valid number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

function getBusinessUnits() {

  const businessUnitOptions = [];
  businessUnits.forEach((businessUnit => {
    businessUnitOptions.push(
        <Option value={businessUnit.id}>{businessUnit.id} - {businessUnit.name}</Option>
    )
  }));

  return businessUnitOptions;
}

const SearchForm = () => {
    const priceValidationContext = useContext(PriceValidationContext);

    // const priceReducer = (currentState, action) => {
    //     switch (action.type) {
    //         case 'SET_RESPONSE':
    //         {
    //             console.log("Action with resp: ", action);
    //             // priceValidationContext.setPriceData(action.payload);
    //             return action.payload;
    //         }
    //
    //         default :
    //             throw Error("Should not reach this!")
    //     }
    // };

    // const [priceDetails, dispatch] = useReducer(priceReducer, []);


    const onSubmit = (values) => {
        priceValidationContext.setPriceData({ ...priceValidationContext.priceData, isLoading: true, error: null, requestParams: values, response: null });
        console.log(values);
        return priceRequestHandler(values);
  };

  const priceRequestHandler = (requestData) => {
      fetch('http://internal-alb-cloud-pci-bff-exe-1912452817.us-east-1.elb.amazonaws.com/v1/pci-bff/pricing/pricing-data', {
          method: 'POST',
          body: JSON.stringify({
              "businessUnitNumber": "001",
              "customerAccount": "571549",
              "priceRequestDate": "20200724",
              "requestedQuantity": 12.00,
              "products": [
                  {
                      "supc": "3183792",
                      "splitFlag": false
                  }
              ]
          }),
          headers: {'Content-Type': 'application/json'}
      })
          .then(response => response.json())
          .then( responseBody => {
              // priceValidationContext.setPriceData(responseBody);
              priceValidationContext.setPriceData(temp);
              return null;
          });

  };

  return (
    <>
      <div className="panel-header">
        <i className="icon fi flaticon-list"/>
        Search
      </div>
      <div className="search-form">
        <Form
            name="nest-messages"
            onFinish={onSubmit}
            validateMessages={validateMessages}
            initialValues={{quantity:1, site:'002', itemnum: 1, customer: "1"}}
        >
          <Form.Item
              name="site"
              label="Site"
              rules={[
                {
                  required: true,
                },
              ]}>
            <Select placeholder="Select Site">
              {getBusinessUnits()}
            </Select>
          </Form.Item>
          <Form.Item
              name="customer"
              label="Customer"
              rules={[
                  {
                      required: true,
                  },
                  {
                      whitespace: true,
                      message: "Customer cannot be empty"
                  },
              ]}>
            <Input/>
          </Form.Item>
          <Form.Item
              name="itemnum"
              label="Item #"
              rules={[
                  {
                      type: "number",
                      message : "Not a valid number"
                  },
                  {
                    required: true
                  }
              ]}
          >
            <InputNumber/>
          </Form.Item>
          <Form.Item
              name="date"
              label="Date"
              rules={[
                  {
                    required: true,
                  },
              ]}>
            <DatePicker/>
          </Form.Item>
          <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                  () => ({
                      validator(rule, value) {
                          if (value && !isNaN(value) && 1 <= value && value <= 1000) {
                              return Promise.resolve();
                          }
                          return Promise.reject('Quantity must be a valid number between 1 and 1000');
                      },
                  })
              ]}>
            <InputNumber defaultValue="1"/>
          </Form.Item>

          <Form.Item name="split" label="Split">
            <Checkbox/>
          </Form.Item>
          <Form.Item className="search-btn-wrapper">
            <button
                type="primary"
                htmlType="submit"
                className="search-btn outlined-btn">
              Search
            </button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SearchForm;
