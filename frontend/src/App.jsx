import { useEffect, useMemo, useState } from "react";
import api, { login } from "./api";

const emptyProduct = {
  sku: "",
  name: "",
  price: "",
  cost_price: "",
  reorder_level: 10,
  active: true,
  category: 1,
  supplier: 1,
};

const emptyMovement = {
  product: "",
  warehouse: "",
  quantity: "",
  reference: "",
};

function App() {
  const [page, setPage] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [customersCount, setCustomersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");
    setLoggingIn(true);

    try {
      await login(username.trim(), password);

      setIsAuthenticated(true);
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);

      setLoginError(
        err.response?.data?.detail ||
          "Invalid username or password."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setIsAuthenticated(false);
    setProducts([]);
    setInventory([]);
    setCustomersCount(0);
    setOrdersCount(0);
    setPage("dashboard");
    setError("");
    setMessage("");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      
const [
  productsResponse,
  customersResponse,
  ordersResponse,
] = await Promise.all([
  api.get("/products/?page_size=100"),
  api.get("/customers/"),
  api.get("/orders/"),
]);


let productData = [];
let nextPage = null;

if (productsResponse.data.results) {
  productData = [...productsResponse.data.results];
  nextPage = productsResponse.data.next;

  while (nextPage) {
    const nextResponse = await api.get(nextPage);

    productData.push(
      ...(nextResponse.data.results || [])
    );

    nextPage = nextResponse.data.next;
  }
} else {
  productData = productsResponse.data;
}

setProducts(productData);

      

      setCustomersCount(
        customersResponse.data.count ?? customerData.length
      );

      setOrdersCount(
        ordersResponse.data.count ?? orderData.length
      );

      await loadInventory();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        handleLogout();
        setLoginError(
          "Your session has expired. Please sign in again."
        );
      } else {
        setError("Unable to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      setInventoryLoading(true);

      const response = await api.get("/inventory/");

      setInventory(
        response.data.results ||
          response.data ||
          []
      );
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Unable to load inventory.");
      }
    } finally {
      setInventoryLoading(false);
    }
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        username={username}
        password={password}
        loginError={loginError}
        loggingIn={loggingIn}
        setUsername={setUsername}
        setPassword={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div style={styles.app}>
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        {message && (
          <div style={styles.successMessage}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            ⚠ {error}
          </div>
        )}

        {page === "dashboard" && (
          <Dashboard
            products={products}
            inventory={inventory}
            customersCount={customersCount}
            ordersCount={ordersCount}
            loading={loading}
            onRefresh={loadDashboard}
          />
        )}

        {page === "products" && (
          <ProductsPage
            products={products}
            setProducts={setProducts}
            showMessage={showMessage}
            setError={setError}
          />
        )}

        {page === "inventory" && (
          <InventoryPage
            inventory={inventory}
            loading={inventoryLoading}
            onRefresh={loadInventory}
          />
        )}

        {[
          "orders",
          "customers",
          "suppliers",
          "shipments",
          "settings",
        ].includes(page) && (
          <ComingSoon
            title={capitalize(page)}
            onBack={() => setPage("dashboard")}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginScreen({
  username,
  password,
  loginError,
  loggingIn,
  setUsername,
  setPassword,
  onSubmit,
}) {
  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.loginBrand}>
          <div style={styles.loginLogo}>R</div>

          <div>
            <div style={styles.loginBrandName}>
              RetailOps
            </div>

            <div style={styles.loginBrandSub}>
              Operations Platform
            </div>
          </div>
        </div>

        <div style={styles.loginHeading}>
          <h1 style={styles.loginTitle}>
            Welcome back
          </h1>

          <p style={styles.loginDescription}>
            Sign in to manage your retail operations.
          </p>
        </div>

        {loginError && (
          <div style={styles.loginError}>
            ⚠ {loginError}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={styles.loginField}>
            <label style={styles.loginLabel}>
              Email
            </label>

            <input
              type="email"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="username"
              required
              style={styles.loginInput}
            />
          </div>

          <div style={styles.loginField}>
            <label style={styles.loginLabel}>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={styles.loginInput}
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            style={styles.loginButton}
          >
            {loggingIn
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <div style={styles.loginFooter}>
          JWT-secured RetailOps API
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  setPage,
  onLogout,
}) {
  const menu = [
    {
      section: "MAIN MENU",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: "▦",
        },
        {
          id: "products",
          label: "Products",
          icon: "▣",
        },
        {
          id: "orders",
          label: "Orders",
          icon: "▤",
        },
        {
          id: "customers",
          label: "Customers",
          icon: "♙",
        },
        {
          id: "inventory",
          label: "Inventory",
          icon: "◈",
        },
        {
          id: "suppliers",
          label: "Suppliers",
          icon: "◆",
        },
        {
          id: "shipments",
          label: "Shipments",
          icon: "➜",
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: "⚙",
        },
      ],
    },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logo}>R</div>

        <div>
          <div style={styles.brandName}>
            RetailOps
          </div>

          <div style={styles.brandSub}>
            Operations Platform
          </div>
        </div>
      </div>

      <div style={styles.sidebarContent}>
        {menu.map((group) => (
          <div
            key={group.section}
            style={styles.menuGroup}
          >
            <div style={styles.menuTitle}>
              {group.section}
            </div>

            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  ...styles.menuItem,
                  ...(page === item.id
                    ? styles.menuItemActive
                    : {}),
                }}
              >
                <span style={styles.menuIcon}>
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.sidebarFooter}>
        <div style={styles.onlineDot} />

        <div style={{ flex: 1 }}>
          <div style={styles.footerTitle}>
            System Online
          </div>

          <div style={styles.footerSub}>
            API Connected
          </div>
        </div>

        <button
          onClick={onLogout}
          style={styles.logoutButton}
          title="Logout"
        >
          ⇥
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  products,
  inventory,
  customersCount,
  ordersCount,
  loading,
  onRefresh,
}) {
  const lowStock = inventory.filter(
    (item) =>
      Number(item.available_stock ?? 0) <=
      Number(item.reorder_level ?? 0)
  ).length;

  const totalStock = inventory.reduce(
    (sum, item) =>
      sum + Number(item.available_stock ?? 0),
    0
  );

  const healthyStock = Math.max(
    inventory.length - lowStock,
    0
  );

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Retail Operations Dashboard"
        description="Monitor products, inventory and business operations."
        action={
          <button
            onClick={onRefresh}
            style={styles.primaryButton}
          >
            ↻ Refresh
          </button>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div style={styles.statsGrid}>
            <StatCard
              title="Products"
              value={products.length}
              subtitle="Active catalog"
              icon="▣"
            />

            <StatCard
              title="Customers"
              value={customersCount}
              subtitle="Registered customers"
              icon="♙"
            />

            <StatCard
              title="Orders"
              value={ordersCount}
              subtitle="Total orders"
              icon="▤"
            />

            <StatCard
              title="Available Stock"
              value={totalStock}
              subtitle="Units available"
              icon="◈"
            />
          </div>

          <div style={styles.twoColumn}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Inventory Health
                  </h2>

                  <p style={styles.panelSub}>
                    Current stock availability
                  </p>
                </div>
              </div>

              <div style={styles.healthRow}>
                <div style={styles.healthBox}>
                  <div style={styles.healthNumber}>
                    {inventory.length}
                  </div>

                  <div style={styles.healthLabel}>
                    Inventory Records
                  </div>
                </div>

                <div style={styles.healthBox}>
                  <div
                    style={{
                      ...styles.healthNumber,
                      color:
                        lowStock > 0
                          ? "#dc2626"
                          : "#16a34a",
                    }}
                  >
                    {lowStock}
                  </div>

                  <div style={styles.healthLabel}>
                    Low Stock
                  </div>
                </div>

                <div style={styles.healthBox}>
                  <div
                    style={{
                      ...styles.healthNumber,
                      color: "#16a34a",
                    }}
                  >
                    {healthyStock}
                  </div>

                  <div style={styles.healthLabel}>
                    Healthy
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>
                    Platform Status
                  </h2>

                  <p style={styles.panelSub}>
                    RetailOps service health
                  </p>
                </div>
              </div>

              <div style={styles.statusList}>
                <StatusRow
                  label="Frontend"
                  status="Operational"
                />

                <StatusRow
                  label="Django API"
                  status="Connected"
                />

                <StatusRow
                  label="Database"
                  status="Configured"
                />

                <StatusRow
                  label="Inventory API"
                  status="Live"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   PRODUCTS
========================================================= */

function ProductsPage({
  products,
  setProducts,
  showMessage,
  setError,
}) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] =
    useState(false);
  const [editingProduct, setEditingProduct] =
    useState(null);
  const [form, setForm] =
    useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.sku || "")
          .toLowerCase()
          .includes(query)
    );
  }, [products, search]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ ...emptyProduct });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      sku: product.sku || "",
      name: product.name || "",
      price: product.price || "",
      cost_price:
        product.cost_price || "",
      reorder_level:
        product.reorder_level ?? 10,
      active:
        product.active ?? true,
      category:
        product.category ?? 1,
      supplier:
        product.supplier ?? 1,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);
    setForm({ ...emptyProduct });
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        price: String(form.price),
        cost_price: String(form.cost_price),
        reorder_level: Number(form.reorder_level),
        category: Number(form.category),
        supplier: Number(form.supplier),
        active: Boolean(form.active),
      };

      let response;

      if (editingProduct) {
        response = await api.put(
          `/products/${editingProduct.id}/`,
          payload
        );

        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id
              ? response.data
              : product
          )
        );

        showMessage("Product updated successfully.");
      } else {
        response = await api.post(
          "/products/",
          payload
        );

        setProducts((current) => [
          response.data,
          ...current,
        ]);

        showMessage("Product created successfully.");
      }

      closeModal();
    } catch (err) {
      console.error(err);

      const data = err.response?.data;
      const detail =
        data?.detail ||
        data?.sku?.[0] ||
        data?.name?.[0] ||
        "Unable to save product.";

      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/products/${product.id}/`
      );

      setProducts((current) =>
        current.filter(
          (item) =>
            item.id !== product.id
        )
      );

      showMessage(
        "Product deleted successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete product."
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Products"
        title="Product Management"
        description="Manage your product catalog and pricing."
        action={
          <button
            onClick={openAdd}
            style={styles.primaryButton}
          >
            + Add Product
          </button>
        }
      />

      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by product name or SKU..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.resultCount}>
          {filteredProducts.length} products
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>
                  Product
                </th>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>
                  Reorder
                </th>
                <th style={styles.th}>
                  Status
                </th>
                <th style={styles.th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (product) => (
                  <tr key={product.id}>
                    <td style={styles.td}>
                      #{product.id}
                    </td>

                    <td style={styles.td}>
                      <div
                        style={
                          styles.productName
                        }
                      >
                        {product.name}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          styles.skuBadge
                        }
                      >
                        {product.sku}
                      </span>
                    </td>

                    <td style={styles.td}>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td style={styles.td}>
                      {product.reorder_level ??
                        0}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(product.active
                            ? styles.statusHealthy
                            : styles.statusInactive),
                        }}
                      >
                        {product.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div
                        style={
                          styles.actionGroup
                        }
                      >
                        <button
                          onClick={() =>
                            openEdit(product)
                          }
                          style={
                            styles.editButton
                          }
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(
                              product
                            )
                          }
                          style={
                            styles.deleteButton
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {filteredProducts.length ===
                0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={
                      styles.emptyCell
                    }
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          form={form}
          editingProduct={editingProduct}
          saving={saving}
          onChange={handleChange}
          onSubmit={saveProduct}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* =========================================================
   PRODUCT MODAL
========================================================= */

function ProductModal({
  form,
  editingProduct,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p style={styles.modalSub}>
              {editingProduct
                ? "Update product information."
                : "Create a new catalog product."}
            </p>
          </div>

          <button
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={styles.formGrid}>
            <FormField
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={onChange}
              required
            />

            <FormField
              label="Product Name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />

            <FormField
              label="Selling Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onChange}
              required
            />

            <FormField
              label="Cost Price"
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              value={form.cost_price}
              onChange={onChange}
              required
            />

            <FormField
              label="Reorder Level"
              name="reorder_level"
              type="number"
              min="0"
              value={
                form.reorder_level
              }
              onChange={onChange}
            />

            <FormField
              label="Category ID"
              name="category"
              type="number"
              min="1"
              value={form.category}
              onChange={onChange}
            />

            <FormField
              label="Supplier ID"
              name="supplier"
              type="number"
              min="1"
              value={form.supplier}
              onChange={onChange}
            />
          </div>

          <label
            style={
              styles.checkboxLabel
            }
          >
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={onChange}
            />
            Product is active
          </label>

          <div
            style={
              styles.modalActions
            }
          >
            <button
              type="button"
              onClick={onClose}
              style={
                styles.secondaryButton
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={
                styles.primaryButton
              }
            >
              {saving
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   INVENTORY
========================================================= */

function InventoryPage({
  inventory,
  loading,
  onRefresh,
}) {
  const [search, setSearch] =
    useState("");

  const [movementType, setMovementType] =
    useState(null);

  const [movementForm, setMovementForm] =
    useState(emptyMovement);

  const [movementLoading, setMovementLoading] =
    useState(false);

  const [movementError, setMovementError] =
    useState("");

  const [movementSuccess, setMovementSuccess] =
    useState("");

  const filteredInventory =
    useMemo(() => {
      const query = search
        .toLowerCase()
        .trim();

      if (!query) {
        return inventory;
      }

      return inventory.filter((item) => {
        const productName =
          String(
            item.product_name || ""
          ).toLowerCase();

        const sku = String(
          item.product_sku || ""
        ).toLowerCase();

        const warehouse =
          String(
            item.warehouse_name || ""
          ).toLowerCase();

        return (
          productName.includes(query) ||
          sku.includes(query) ||
          warehouse.includes(query)
        );
      });
    }, [inventory, search]);

  const lowStockItems =
    filteredInventory.filter(
      (item) =>
        Number(
          item.available_stock ?? 0
        ) <=
        Number(
          item.reorder_level ?? 0
        )
    );

  const healthyItems =
    filteredInventory.length -
    lowStockItems.length;

  const totalAvailable =
    filteredInventory.reduce(
      (sum, item) =>
        sum +
        Number(
          item.available_stock ?? 0
        ),
      0
    );

  const productOptions = useMemo(() => {
    const map = new Map();

    inventory.forEach((item) => {
      if (!item.product) return;

      if (!map.has(item.product)) {
        map.set(item.product, {
          id: item.product,
          name:
            item.product_name ||
            `Product #${item.product}`,
          sku:
            item.product_sku ||
            `SKU-${item.product}`,
        });
      }
    });

    return Array.from(
      map.values()
    );
  }, [inventory]);

  const warehouseOptions =
    useMemo(() => {
      const map = new Map();

      inventory.forEach((item) => {
        if (!item.warehouse) return;

        if (!map.has(item.warehouse)) {
          map.set(item.warehouse, {
            id: item.warehouse,
            name:
              item.warehouse_name ||
              `Warehouse #${item.warehouse}`,
          });
        }
      });

      return Array.from(
        map.values()
      );
    }, [inventory]);

  const openMovementModal = (type) => {
    setMovementType(type);

    setMovementForm({
      ...emptyMovement,
      product:
        productOptions.length === 1
          ? String(
              productOptions[0].id
            )
          : "",
      warehouse:
        warehouseOptions.length === 1
          ? String(
              warehouseOptions[0].id
            )
          : "",
    });

    setMovementError("");
    setMovementSuccess("");
  };

  const closeMovementModal = () => {
    if (movementLoading) return;

    setMovementType(null);
    setMovementForm({
      ...emptyMovement,
    });
    setMovementError("");
    setMovementSuccess("");
  };

  const handleMovementChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setMovementForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleMovementSubmit =
    async (event) => {
      event.preventDefault();

      setMovementError("");
      setMovementSuccess("");

      const productId = Number(
        movementForm.product
      );

      const warehouseId = Number(
        movementForm.warehouse
      );

      const quantity = Number(
        movementForm.quantity
      );

      if (
        !productId ||
        !warehouseId ||
        quantity <= 0
      ) {
        setMovementError(
          "Please select a product, warehouse and enter a valid quantity."
        );
        return;
      }

      try {
        setMovementLoading(true);

        await api.post(
          "/stock-movements/",
          {
            product: productId,
            warehouse: warehouseId,
            movement_type:
              movementType,
            quantity,
            reference:
              movementForm.reference.trim() ||
              `${
                movementType === "IN"
                  ? "STOCK-IN"
                  : "STOCK-OUT"
              }-${Date.now()}`,
          }
        );

        setMovementSuccess(
          movementType === "IN"
            ? "Stock added successfully."
            : "Stock removed successfully."
        );

        await onRefresh();

        setTimeout(() => {
          closeMovementModal();
        }, 800);
      } catch (error) {
        console.error(error);

        const data =
          error.response?.data;

        const message =
          data?.quantity?.[0] ||
          data?.detail ||
          data?.non_field_errors?.[0] ||
          "Unable to update stock. Please try again.";

        setMovementError(message);
      } finally {
        setMovementLoading(false);
      }
    };

  return (
    <div>
      <PageHeader
        eyebrow="Inventory"
        title="Inventory Management"
        description="Monitor and control stock levels across warehouses."
        action={
          <div
            style={
              styles.headerButtons
            }
          >
            <button
              onClick={() =>
                openMovementModal("IN")
              }
              style={
                styles.primaryButton
              }
            >
              + Stock In
            </button>

            <button
              onClick={() =>
                openMovementModal("OUT")
              }
              style={
                styles.stockOutButton
              }
            >
              − Stock Out
            </button>

            <button
              onClick={onRefresh}
              style={
                styles.secondaryButton
              }
            >
              ↻ Refresh
            </button>
          </div>
        }
      />

      <div style={styles.statsGrid}>
        <StatCard
          title="Inventory Records"
          value={
            filteredInventory.length
          }
          subtitle="Live records"
          icon="◈"
        />

        <StatCard
          title="Low Stock"
          value={
            lowStockItems.length
          }
          subtitle="Needs attention"
          icon="⚠"
          danger={
            lowStockItems.length > 0
          }
        />

        <StatCard
          title="Healthy Stock"
          value={Math.max(
            healthyItems,
            0
          )}
          subtitle="Above reorder level"
          icon="✓"
        />

        <StatCard
          title="Available Units"
          value={totalAvailable}
          subtitle="Current available stock"
          icon="▤"
        />
      </div>

      {lowStockItems.length > 0 && (
        <div style={styles.alertBox}>
          <div style={styles.alertIcon}>
            ⚠
          </div>

          <div>
            <div
              style={styles.alertTitle}
            >
              Low Stock Alert
            </div>

            <div
              style={styles.alertText}
            >
              {lowStockItems.length}{" "}
              product
              {lowStockItems.length !==
              1
                ? "s"
                : ""}{" "}
              reached or crossed the
              reorder level.
            </div>
          </div>
        </div>
      )}

      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <span
            style={styles.searchIcon}
          >
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search product, SKU or warehouse..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.liveBadge}>
          <span
            style={styles.liveDot}
          />

          Live Inventory
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2
              style={styles.panelTitle}
            >
              Stock Overview
            </h2>

            <p style={styles.panelSub}>
              Real-time inventory availability
            </p>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div
            style={
              styles.tableWrapper
            }
          >
            <table
              style={styles.table}
            >
              <thead>
                <tr>
                  <th style={styles.th}>
                    Product
                  </th>

                  <th style={styles.th}>
                    SKU
                  </th>

                  <th style={styles.th}>
                    Warehouse
                  </th>

                  <th style={styles.th}>
                    Stock
                  </th>

                  <th style={styles.th}>
                    Reserved
                  </th>

                  <th style={styles.th}>
                    Available
                  </th>

                  <th style={styles.th}>
                    Reorder
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map(
                  (item) => {
                    const available =
                      Number(
                        item.available_stock ??
                          0
                      );

                    const reorder =
                      Number(
                        item.reorder_level ??
                          0
                      );

                    const isLow =
                      available <=
                      reorder;

                    return (
                      <tr
                        key={item.id}
                      >
                        <td
                          style={
                            styles.td
                          }
                        >
                          <div
                            style={
                              styles.productCell
                            }
                          >
                            <div
                              style={
                                styles.productAvatar
                              }
                            >
                              {getInitial(
                                item.product_name
                              )}
                            </div>

                            <div>
                              <div
                                style={
                                  styles.productName
                                }
                              >
                                {item.product_name ||
                                  `Product #${item.product}`}
                              </div>

                              <div
                                style={
                                  styles.productId
                                }
                              >
                                Inventory #
                                {item.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <span
                            style={
                              styles.skuBadge
                            }
                          >
                            {item.product_sku ||
                              `SKU-${item.product}`}
                          </span>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <div
                            style={
                              styles.warehouseText
                            }
                          >
                            <span>
                              ▣
                            </span>

                            {item.warehouse_name ||
                              `Warehouse #${item.warehouse}`}
                          </div>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <strong>
                            {Number(
                              item.quantity ??
                                0
                            )}
                          </strong>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {Number(
                            item.reserved ??
                              0
                          )}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <strong
                            style={{
                              color:
                                isLow
                                  ? "#dc2626"
                                  : "#16a34a",
                            }}
                          >
                            {available}
                          </strong>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {reorder}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(isLow
                                ? styles.statusLow
                                : styles.statusHealthy),
                            }}
                          >
                            {isLow
                              ? "Low Stock"
                              : "Healthy"}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}

                {filteredInventory.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={
                        styles.emptyCell
                      }
                    >
                      No inventory records
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {movementType && (
        <StockMovementModal
          type={movementType}
          form={movementForm}
          products={productOptions}
          warehouses={
            warehouseOptions
          }
          loading={movementLoading}
          error={movementError}
          success={movementSuccess}
          onChange={
            handleMovementChange
          }
          onSubmit={
            handleMovementSubmit
          }
          onClose={
            closeMovementModal
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   STOCK MOVEMENT MODAL
========================================================= */

function StockMovementModal({
  type,
  form,
  products,
  warehouses,
  loading,
  error,
  success,
  onChange,
  onSubmit,
  onClose,
}) {
  const isStockIn = type === "IN";

  return (
    <div style={styles.modalOverlay}>
      <div
        style={
          styles.movementModal
        }
      >
        <div
          style={styles.modalHeader}
        >
          <div>
            <h2
              style={styles.modalTitle}
            >
              {isStockIn
                ? "Stock In"
                : "Stock Out"}
            </h2>

            <p style={styles.modalSub}>
              {isStockIn
                ? "Add inventory to a warehouse."
                : "Remove inventory from a warehouse."}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={
              styles.closeButton
            }
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div
            style={
              styles.movementBody
            }
          >
            {error && (
              <div
                style={
                  styles.movementError
                }
              >
                ⚠ {error}
              </div>
            )}

            {success && (
              <div
                style={
                  styles.movementSuccess
                }
              >
                ✓ {success}
              </div>
            )}

            <div
              style={styles.formField}
            >
              <label
                style={styles.formLabel}
              >
                Product
              </label>

              <select
                name="product"
                value={form.product}
                onChange={onChange}
                required
                style={
                  styles.formInput
                }
              >
                <option value="">
                  Select product
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={
                        product.id
                      }
                    >
                      {product.name} —{" "}
                      {product.sku}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              style={styles.formField}
            >
              <label
                style={styles.formLabel}
              >
                Warehouse
              </label>

              <select
                name="warehouse"
                value={
                  form.warehouse
                }
                onChange={onChange}
                required
                style={
                  styles.formInput
                }
              >
                <option value="">
                  Select warehouse
                </option>

                {warehouses.map(
                  (warehouse) => (
                    <option
                      key={
                        warehouse.id
                      }
                      value={
                        warehouse.id
                      }
                    >
                      {warehouse.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              style={styles.formField}
            >
              <label
                style={styles.formLabel}
              >
                Quantity
              </label>

              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={
                  form.quantity
                }
                onChange={onChange}
                placeholder="Enter quantity"
                required
                style={
                  styles.formInput
                }
              />
            </div>

            <div
              style={styles.formField}
            >
              <label
                style={styles.formLabel}
              >
                Reference
              </label>

              <input
                name="reference"
                type="text"
                value={
                  form.reference
                }
                onChange={onChange}
                placeholder="PO-1001 / SALE-1001"
                style={
                  styles.formInput
                }
              />
            </div>
          </div>

          <div
            style={
              styles.modalActions
            }
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={
                styles.secondaryButton
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={
                isStockIn
                  ? styles.primaryButton
                  : styles.stockOutButton
              }
            >
              {loading
                ? "Processing..."
                : isStockIn
                ? "Add Stock"
                : "Remove Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div
      style={styles.pageHeader}
    >
      <div>
        <div style={styles.eyebrow}>
          {eyebrow}
        </div>

        <h1 style={styles.pageTitle}>
          {title}
        </h1>

        <p
          style={
            styles.pageDescription
          }
        >
          {description}
        </p>
      </div>

      {action && (
        <div
          style={styles.headerAction}
        >
          {action}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  danger = false,
}) {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
          ...(danger
            ? styles.statIconDanger
            : {}),
        }}
      >
        {icon}
      </div>

      <div
        style={styles.statContent}
      >
        <div
          style={styles.statTitle}
        >
          {title}
        </div>

        <div
          style={{
            ...styles.statValue,
            ...(danger
              ? { color: "#dc2626" }
              : {}),
          }}
        >
          {value}
        </div>

        <div
          style={
            styles.statSubtitle
          }
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  status,
}) {
  return (
    <div style={styles.statusRow}>
      <div
        style={styles.statusLabel}
      >
        <span
          style={styles.greenDot}
        />

        {label}
      </div>

      <span
        style={
          styles.connectedBadge
        }
      >
        {status}
      </span>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  min,
  step,
}) {
  return (
    <div style={styles.formField}>
      <label
        style={styles.formLabel}
      >
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        style={styles.formInput}
      />
    </div>
  );
}

function Loading() {
  return (
    <div style={styles.loading}>
      <div
        style={styles.spinner}
      />

      Loading data...
    </div>
  );
}

function ComingSoon({
  title,
  onBack,
}) {
  return (
    <div>
      <PageHeader
        eyebrow={title}
        title={`${title} Management`}
        description="This module is part of the RetailOps platform."
        action={
          <button
            onClick={onBack}
            style={
              styles.secondaryButton
            }
          >
            ← Dashboard
          </button>
        }
      />

      <div
        style={styles.comingSoon}
      >
        <div
          style={
            styles.comingSoonIcon
          }
        >
          ◈
        </div>

        <h2
          style={
            styles.comingSoonTitle
          }
        >
          {title} module
        </h2>

        <p
          style={
            styles.comingSoonText
          }
        >
          This module is ready for
          the next development phase.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function capitalize(value = "") {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getInitial(name = "") {
  const text = String(name ?? "").trim();

  return text ? text.charAt(0).toUpperCase() : "P";
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  loginPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #eef2ff 100%)",
    padding: "20px",
  },

  loginCard: {
    width: "min(420px, 100%)",
    background: "#fff",
    border: "1px solid #e5eaf0",
    borderRadius: "18px",
    padding: "34px",
    boxShadow:
      "0 20px 60px rgba(15, 23, 42, 0.10)",
  },

  loginBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
  },

  loginLogo: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 800,
  },

  loginBrandName: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#111827",
  },

  loginBrandSub: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },

  loginHeading: {
    marginBottom: "22px",
  },

  loginTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 800,
    color: "#111827",
  },

  loginDescription: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  loginError: {
    marginBottom: "16px",
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: 600,
  },

  loginField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "15px",
  },

  loginLabel: {
    fontSize: "12px",
    color: "#475569",
    fontWeight: 700,
  },

  loginInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    padding: "12px",
    outline: "none",
    fontSize: "13px",
    background: "#fff",
  },

  loginButton: {
    width: "100%",
    border: 0,
    borderRadius: "9px",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 16px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "5px",
  },

  loginFooter: {
    textAlign: "center",
    marginTop: "22px",
    fontSize: "10px",
    color: "#94a3b8",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#111827",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    flexShrink: 0,
  },

  brand: {
    height: "82px",
    padding: "0 22px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid #273244",
  },

  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 800,
  },

  brandName: {
    fontSize: "18px",
    fontWeight: 800,
  },

  brandSub: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },

  sidebarContent: {
    padding: "22px 14px",
    flex: 1,
    overflowY: "auto",
  },

  menuGroup: {
    marginBottom: "28px",
  },

  menuTitle: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    color: "#64748b",
    padding: "0 10px 9px",
  },

  menuItem: {
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#cbd5e1",
    padding: "11px 12px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "14px",
    marginBottom: "3px",
  },

  menuItemActive: {
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
  },

  menuIcon: {
    width: "22px",
    textAlign: "center",
    fontSize: "15px",
  },

  sidebarFooter: {
    padding: "16px 15px 16px 20px",
    borderTop: "1px solid #273244",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  onlineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  footerTitle: {
    fontSize: "12px",
    fontWeight: 600,
  },

  footerSub: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px",
  },

  logoutButton: {
    border: 0,
    background: "#1f2937",
    color: "#cbd5e1",
    width: "30px",
    height: "30px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "16px",
  },

  main: {
    flex: 1,
    minWidth: 0,
    padding: "30px",
    overflowX: "hidden",
  },

  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "26px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "7px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#111827",
  },

  pageDescription: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  headerAction: {
    flexShrink: 0,
  },

  headerButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  primaryButton: {
    border: 0,
    borderRadius: "9px",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow:
      "0 2px 6px rgba(37, 99, 235, 0.2)",
  },

  stockOutButton: {
    border: 0,
    borderRadius: "9px",
    background: "#111827",
    color: "#fff",
    padding: "10px 16px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    background: "#fff",
    color: "#334155",
    padding: "10px 16px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },

  successMessage: {
    marginBottom: "18px",
    padding: "12px 15px",
    borderRadius: "9px",
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: "13px",
    fontWeight: 600,
  },

  errorMessage: {
    marginBottom: "18px",
    padding: "12px 15px",
    borderRadius: "9px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e5eaf0",
    borderRadius: "13px",
    padding: "19px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.03)",
  },

  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: 700,
    flexShrink: 0,
  },

  statIconDanger: {
    background: "#fef2f2",
    color: "#dc2626",
  },

  statContent: {
    minWidth: 0,
  },

  statTitle: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
  },

  statValue: {
    color: "#111827",
    fontSize: "24px",
    fontWeight: 800,
    marginTop: "2px",
  },

  statSubtitle: {
    color: "#94a3b8",
    fontSize: "10px",
    marginTop: "2px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  panel: {
    background: "#fff",
    border: "1px solid #e5eaf0",
    borderRadius: "13px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.03)",
    overflow: "hidden",
  },

  panelHeader: {
    padding: "18px 20px",
    borderBottom:
      "1px solid #eef1f5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  panelTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
    color: "#172033",
  },

  panelSub: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  healthRow: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    padding: "20px",
    gap: "12px",
  },

  healthBox: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "18px 12px",
    textAlign: "center",
  },

  healthNumber: {
    fontSize: "25px",
    fontWeight: 800,
    color: "#172033",
  },

  healthLabel: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "4px",
  },

  statusList: {
    padding: "7px 20px 15px",
  },

  statusRow: {
    padding: "13px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom:
      "1px solid #f1f5f9",
  },

  statusLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#334155",
  },

  greenDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  connectedBadge: {
    fontSize: "10px",
    color: "#15803d",
    background: "#f0fdf4",
    padding: "5px 8px",
    borderRadius: "6px",
    fontWeight: 700,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "16px",
  },

  searchWrapper: {
    position: "relative",
    width: "min(480px, 100%)",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform:
      "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "18px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    padding:
      "11px 13px 11px 37px",
    outline: "none",
    fontSize: "13px",
    background: "#fff",
  },

  resultCount: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 600,
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#f0fdf4",
    color: "#15803d",
    border:
      "1px solid #dcfce7",
    borderRadius: "8px",
    padding: "8px 11px",
    fontSize: "11px",
    fontWeight: 700,
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    padding: "12px 16px",
    textAlign: "left",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    fontWeight: 750,
    borderBottom:
      "1px solid #e5eaf0",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 16px",
    borderBottom:
      "1px solid #eef1f5",
    fontSize: "12px",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  productName: {
    fontWeight: 700,
    color: "#172033",
    fontSize: "12px",
  },

  productId: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "2px",
  },

  skuBadge: {
    display: "inline-block",
    background: "#f1f5f9",
    color: "#475569",
    padding: "5px 7px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: 700,
    fontFamily: "monospace",
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
  },

  statusHealthy: {
    background: "#ecfdf3",
    color: "#15803d",
  },

  statusLow: {
    background: "#fef2f2",
    color: "#dc2626",
  },

  statusInactive: {
    background: "#f1f5f9",
    color: "#64748b",
  },

  actionGroup: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    border:
      "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "6px 9px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },

  deleteButton: {
    border:
      "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "6px 9px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer",
  },

  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  productAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
    flexShrink: 0,
  },

  warehouseText: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 16px",
    marginBottom: "17px",
    borderRadius: "10px",
    background: "#fff7ed",
    border:
      "1px solid #fed7aa",
  },

  alertIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    background: "#ffedd5",
    color: "#ea580c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  alertTitle: {
    color: "#9a3412",
    fontWeight: 750,
    fontSize: "12px",
  },

  alertText: {
    color: "#c2410c",
    fontSize: "11px",
    marginTop: "2px",
  },

  emptyCell: {
    padding: "45px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
  },

  loading: {
    minHeight: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#64748b",
    fontSize: "13px",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #dbeafe",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "min(650px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "15px",
    boxShadow:
      "0 20px 50px rgba(15, 23, 42, 0.25)",
  },

  movementModal: {
    width: "min(520px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "15px",
    boxShadow:
      "0 20px 50px rgba(15, 23, 42, 0.25)",
  },

  modalHeader: {
    padding: "20px",
    borderBottom:
      "1px solid #eef1f5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  modalTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 800,
  },

  modalSub: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  closeButton: {
    border: 0,
    background: "#f1f5f9",
    color: "#475569",
    width: "30px",
    height: "30px",
    borderRadius: "7px",
    fontSize: "20px",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
    padding: "20px 20px 10px",
  },

  movementBody: {
    display: "grid",
    gap: "15px",
    padding: "20px",
  },

  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  formLabel: {
    fontSize: "11px",
    color: "#475569",
    fontWeight: 700,
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe2ea",
    borderRadius: "8px",
    padding: "10px 11px",
    fontSize: "13px",
    outline: "none",
    background: "#fff",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 20px 15px",
    fontSize: "12px",
    color: "#475569",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "15px 20px 20px",
    borderTop:
      "1px solid #eef1f5",
  },

  movementError: {
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: 600,
  },

  movementSuccess: {
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#ecfdf3",
    border:
      "1px solid #bbf7d0",
    color: "#166534",
    fontSize: "12px",
    fontWeight: 600,
  },

  comingSoon: {
    minHeight: "350px",
    background: "#fff",
    border: "1px solid #e5eaf0",
    borderRadius: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  comingSoonIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "15px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  comingSoonTitle: {
    margin: "15px 0 5px",
    fontSize: "20px",
  },

  comingSoonText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },
};

export default App;
