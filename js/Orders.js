console.log("✅ orders.js loaded");

// ----------------- Load Orders -----------------
function loadOrders() {
  console.log("Fetching orders...");

  fetch("db/orders_get.php")
    .then(r => r.json())
    .then(data => {
      console.log("Orders data:", data);

      const pendingTbody = document.getElementById("pending-orders-list");
      const completedTbody = document.getElementById("completed-orders-list");

      if (!pendingTbody || !completedTbody) {
        console.error("❌ Orders table bodies not found.");
        return;
      }

      // Clear tables
      pendingTbody.innerHTML = "";
      completedTbody.innerHTML = "";

      // Pending orders
      if (Array.isArray(data.pending) && data.pending.length > 0) {
        data.pending.forEach(o => {
          pendingTbody.insertAdjacentHTML(
            "beforeend",
            `<tr data-id="${o.orderID}">
                <td>${o.orderID}</td>
                <td>${o.customerID || "-"}</td>
                <td>${o.paymentMethod}</td>
                <td>${o.createdAt}</td>
                <td>${o.items}</td>
                <td>₱${o.totalAmount}</td>
                <td>
                  <button class="complete-btn" data-id="${o.orderID}">Complete</button>
                  <button class="cancel-btn" data-id="${o.orderID}">Cancel</button>
                </td>
             </tr>`
          );
        });
      } else {
        pendingTbody.innerHTML = `<tr><td colspan="7">No pending orders</td></tr>`;
      }

      // Completed orders
      if (Array.isArray(data.completed) && data.completed.length > 0) {
        data.completed.forEach(o => {
          completedTbody.insertAdjacentHTML(
            "beforeend",
            `<tr>
                <td>${o.orderID}</td>
                <td>${o.customerID || "-"}</td>
                <td>${o.paymentMethod}</td>
                <td>${o.createdAt}</td>
                <td>${o.items}</td>
                <td>₱${o.totalAmount}</td>
             </tr>`
          );
        });
      } else {
        completedTbody.innerHTML = `<tr><td colspan="6">No completed orders</td></tr>`;
      }

      attachOrderButtons();
    })
    .catch(err => console.error("❌ Error loading orders:", err));
}

// ----------------- Attach Button Events -----------------
function attachOrderButtons() {
  document.querySelectorAll(".complete-btn").forEach(btn => {
    btn.addEventListener("click", () => updateOrder(btn.dataset.id, "complete"));
  });

  document.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => updateOrder(btn.dataset.id, "cancel"));
  });
}

// ----------------- Update Order -----------------
function updateOrder(orderID, action) {
  console.log(`Updating order ${orderID} → ${action}`);

  const formData = new FormData();
  formData.append("orderID", orderID);
  formData.append("action", action);

  fetch("db/orders_update.php", { method: "POST", body: formData })
    .then(r => r.json())
    .then(res => {
      if (res.status === "success") {
        console.log("Order updated:", res);
        loadOrders(); // refresh tables
      } else {
        console.error("❌ Failed to update order:", res.message);
      }
    })
    .catch(err => console.error("❌ Error updating order:", err));
}

// ----------------- Init -----------------
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});
