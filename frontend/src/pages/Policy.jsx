export default function Policy() {
  return (
    <>
      <section className="phead"><div className="wrap"><h1>Cancellation policy</h1><p>How cancelling, refunds and order confirmation work.</p></div></section>
      <section className="sec">
        <div className="wrap narrow">
          <div className="card policy">
            <h3>Cancelling an order</h3>
            <ul>
              <li>You can cancel on the Order tracking page until your order is out for delivery.</li>
              <li>We ask you to confirm twice, so an order is never cancelled by accident.</li>
              <li>You need the phone number used for the order to cancel it.</li>
              <li>Once the rider has left, the order cannot be cancelled online. Please call us.</li>
            </ul>
            <h3>Cash on delivery confirmation</h3>
            <ul>
              <li>After you place a cash on delivery order, tap Confirm order within 20 minutes.</li>
              <li>If we do not hear from you in time, the order is cancelled automatically.</li>
              <li>If this happens repeatedly, cash on delivery may be switched off for your number and you will need to pay online.</li>
            </ul>
            <h3>Online payments (Google Pay, PhonePe, UPI)</h3>
            <ul>
              <li>Your order is confirmed once the payment succeeds. Unpaid orders are cancelled after 15 minutes.</li>
              <li>If you cancel a paid order, the full amount is refunded to the same account. Banks usually take 5 to 7 working days.</li>
              <li>If money was deducted but the order shows as unpaid, it is refunded automatically. Contact us if it does not arrive.</li>
            </ul>
            <h3>GST</h3>
            <p>Prices on the menu are before tax. GST (CGST + SGST) is added at checkout and shown as a separate line on your bill.</p>
          </div>
        </div>
      </section>
    </>
  )
}
