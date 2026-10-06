import { sendEmail } from "./email.service";

import { rfqSubmittedTemplate } from "./templates/rfqSubmitted";
import { quoteApprovedTemplate } from "./templates/quoteApproved";
import { paymentReceivedTemplate } from "./templates/paymentReceived";
import { shipmentShippedTemplate } from "./templates/shipmentShipped";
import { deliveredTemplate } from "./templates/delivered";

export const sendRFQSubmittedNotification = async (

    email: string,

    buyerName: string

) => {

    await sendEmail(

        email,

        "RFQ Submitted Successfully",

        rfqSubmittedTemplate(buyerName)

    );

};

export const sendQuoteApprovedNotification = async (

    email: string,

    buyerName: string

) => {

    await sendEmail(

        email,

        "Quotation Approved",

        quoteApprovedTemplate(buyerName)

    );

};

export const sendPaymentReceivedNotification = async (

    email: string,

    buyerName: string

) => {

    await sendEmail(

        email,

        "Payment Received",

        paymentReceivedTemplate(buyerName)

    );

};

export const sendShipmentNotification = async (

    email: string,

    buyerName: string

) => {

    await sendEmail(

        email,

        "Shipment Shipped",

        shipmentShippedTemplate(buyerName)

    );

};

export const sendDeliveredNotification = async (

    email: string,

    buyerName: string

) => {

    await sendEmail(

        email,

        "Shipment Delivered",

        deliveredTemplate(buyerName)

    );

};