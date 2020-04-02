const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

if (window.PaymentRequest) {
    const request = createPaymentRequest();

    request.canMakePayment()
        .then(function(result) {
            if (result) {
                // Display PaymentRequest dialog on interaction with the existing checkout button
                document.getElementById('buyButton')
                    .addEventListener('click', onBuyClicked);
            }
        })
        .catch(function(err) {
            showErrorForDebugging(
                'canMakePayment() error! ' + err.name + ' error: ' + err.message);
        });
} else {
    showErrorForDebugging('PaymentRequest API not available.');
}
function onBuyClicked() {
    createPaymentRequest()
        .show()
        .then(function(response) {
            // Dismiss payment dialog.
            response.complete('success');
            handlePaymentResponse(response);
        })
        .catch(function(err) {
            showErrorForDebugging(
                'show() error! ' + err.name + ' error: ' + err.message);
        });
}
function getGooglePaymentsConfiguration() {
    return {
        environment: 'TEST',
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
            // A merchant ID is available after approval by Google.
            // 'merchantId':'0123456789',
            merchantName: 'Example Merchant'
        },
        allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
                allowedAuthMethods: allowedCardAuthMethods,
                allowedCardNetworks: allowedCardNetworks
            },
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                // Check with your payment gateway on the parameters to pass.
                // @see {@link https://developers.google.com/pay/api/web/reference/request-objects#gateway}
                parameters: {
                    'gateway': 'example',
                    'gatewayMerchantId': 'exampleGatewayMerchantId'
                }
            }
        }]
    };
}


function createPaymentRequest() {
    // Add support for the Google Pay API.
    const methodData = [{
        supportedMethods: 'https://google.com/pay',
        data: getGooglePaymentsConfiguration()
    }];
    // Add other supported payment methods.
    methodData.push({
        supportedMethods: 'basic-card',
        data: {
            supportedNetworks:
                Array.from(allowedCardNetworks, (network) => network.toLowerCase())
        }
    });

    const details = {
        total: {label: 'Test Purchase', amount: {currency: 'USD', value: '1.00'}}
    };

    const options = {
        requestPayerEmail: true,
        requestPayerName: true
    };

    return new PaymentRequest(methodData, details, options);
}


function handlePaymentResponse(response) {
    const formattedResponse = document.createElement('pre');
    formattedResponse.appendChild(
        document.createTextNode(JSON.stringify(response.toJSON(), null, 2)));
    document.getElementById('checkout')
        .insertAdjacentElement('afterend', formattedResponse);
}


function showErrorForDebugging(text) {
    const errorDisplay = document.createElement('code');
    errorDisplay.style.color = 'red';
    errorDisplay.appendChild(document.createTextNode(text));
    const p = document.createElement('p');
    p.appendChild(errorDisplay);
    document.getElementById('checkout').insertAdjacentElement('afterend', p);
}