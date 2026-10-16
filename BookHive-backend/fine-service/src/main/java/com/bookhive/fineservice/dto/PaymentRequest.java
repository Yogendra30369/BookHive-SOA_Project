package com.bookhive.fineservice.dto;

public class PaymentRequest {
    private String paymentMethod;
    private String transactionId;

    public PaymentRequest() {}

    public PaymentRequest(String paymentMethod, String transactionId) {
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
    }

    public static PaymentRequestBuilder builder() {
        return new PaymentRequestBuilder();
    }

    public static class PaymentRequestBuilder {
        private String paymentMethod;
        private String transactionId;

        public PaymentRequestBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public PaymentRequestBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }

        public PaymentRequest build() {
            return new PaymentRequest(paymentMethod, transactionId);
        }
    }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}