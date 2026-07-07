export const PERMISSION_GROUPS = {

    PRODUCTS: [
        "PRODUCT_VIEW",
        "PRODUCT_CREATE",
        "PRODUCT_UPDATE",
        "PRODUCT_DELETE",
    ],

    ORDERS: [
        "ORDER_VIEW",
        "ORDER_UPDATE",
    ],

    RFQ: [
        "RFQ_CREATE",
        "RFQ_VIEW",
        "RFQ_APPROVE",
    ],

    BULK_ORDERS: [
        "BULK_ORDER_VIEW",
        "BULK_ORDER_UPDATE",
        "BULK_ORDER_PAYMENT",
    ],

    SHIPMENTS: [
        "SHIPMENT_VIEW",
        "SHIPMENT_CREATE",
        "SHIPMENT_UPDATE",
    ],

    INVOICES: [
        "INVOICE_VIEW",
    ],

    REPORTS: [
        "REPORT_VIEW",
    ],

    DASHBOARD: [
        "DASHBOARD_VIEW",
    ],

    USERS: [
        "USER_MANAGEMENT",
    ],

    AUDIT: [
        "AUDIT_VIEW",
    ],

    SETTINGS: [
        "SETTINGS_MANAGEMENT",
    ],

} as const;