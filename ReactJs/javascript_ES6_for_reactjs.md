```javascript
/**
 * React-Focused Modern JavaScript Showcase
 * ----------------------------------------
 * This single file demonstrates the JavaScript ES6+ / ESNext features and
 * concepts most commonly used in React applications.
 *
 * Notes:
 * - This is plain JavaScript written in a React style.
 * - It is intended as a learning/reference file.
 * - Some examples are illustrative and grouped together in one file.
 * - In a real app, you would split components, hooks, utils, and services
 *   into separate files.
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
  createContext,
  useContext
} from "react";

/* ============================================================================
 * 1. Constants, let, template literals, arrow functions
 * ============================================================================
 */

const APP_NAME = "React JS Showcase";
const APP_VERSION = "1.0.0";

const formatTitle = (name, version) => `${name} v${version}`;

/* ============================================================================
 * 2. Destructuring, default parameters, rest parameters
 * ============================================================================
 */

function logValues(prefix = "Values", ...values) {
  console.log(prefix, values);
}

logValues("Demo", 1, 2, 3);

const user = {
  id: 101,
  profile: {
    firstName: "James",
    lastName: "King"
  },
  role: "admin"
};

const {
  id,
  role,
  profile: { firstName, lastName }
} = user;

console.log(id, role, firstName, lastName);

/* ============================================================================
 * 3. Spread syntax for arrays and objects
 * ============================================================================
 * Extremely common in React because state should be treated as immutable.
 */

const originalTags = ["react", "javascript"];
const newTags = [...originalTags, "hooks"];

const originalSettings = {
  theme: "light",
  compactMode: false
};

const updatedSettings = {
  ...originalSettings,
  theme: "dark"
};

console.log(newTags);
console.log(updatedSettings);

/* ============================================================================
 * 4. Optional chaining and nullish coalescing
 * ============================================================================
 */

const apiResponse = {
  data: {
    user: {
      displayName: "Jamie"
    }
  }
};

const displayName = apiResponse?.data?.user?.displayName ?? "Anonymous";
const missingNickname = apiResponse?.data?.user?.nickname ?? "No nickname";

console.log(displayName, missingNickname);

/* ============================================================================
 * 5. Array methods used heavily in React rendering
 * ============================================================================
 */

const products = [
  { id: 1, name: "Laptop", price: 1200, inStock: true },
  { id: 2, name: "Mouse", price: 25, inStock: true },
  { id: 3, name: "Keyboard", price: 80, inStock: false }
];

const productNames = products.map(product => product.name);
const inStockProducts = products.filter(product => product.inStock);
const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
const firstCheapProduct = products.find(product => product.price < 50);

console.log(productNames, inStockProducts, totalPrice, firstCheapProduct);

/* ============================================================================
 * 6. A small helper using named exports style logic
 * ============================================================================
 */

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP"
});

const formatCurrency = amount => currencyFormatter.format(amount);

/* ============================================================================
 * 7. React Context
 * ============================================================================
 * Context is often used for theme, auth, locale, etc.
 */

const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  // useMemo avoids recreating the context value object on every render
  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme(currentTheme => (currentTheme === "light" ? "dark" : "light"))
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

/* ============================================================================
 * 8. Reducer pattern
 * ============================================================================
 * Useful when state transitions are more structured than simple useState.
 */

const initialCartState = {
  items: [],
  discount: 0
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case "SET_DISCOUNT":
      return {
        ...state,
        discount: action.payload
      };

    default:
      return state;
  }
}

/* ============================================================================
 * 9. Reusable child component
 * ============================================================================
 * Shows props destructuring and conditional rendering.
 */

function ProductCard({ product, onAddToCart }) {
  const { id, name, price, inStock } = product;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 12,
        marginBottom: 8,
        borderRadius: 8
      }}
    >
      <h3>{name}</h3>
      <p>ID: {id}</p>
      <p>Price: {formatCurrency(price)}</p>

      {/* Conditional rendering */}
      {inStock ? (
        <button onClick={() => onAddToCart(product)}>Add to cart</button>
      ) : (
        <p>Out of stock</p>
      )}
    </div>
  );
}

/* ============================================================================
 * 10. Custom hook
 * ============================================================================
 * Hooks let us reuse stateful logic.
 */

function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;

    // Cleanup is optional here, but shown for teaching purposes
    return () => {
      document.title = "React App";
    };
  }, [title]);
}

/* ============================================================================
 * 11. Async helper with fetch, async/await, error handling
 * ============================================================================
 */

async function fetchUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

/* ============================================================================
 * 12. Main demo component
 * ============================================================================
 */

function Dashboard() {
  const { theme, toggleTheme } = useTheme();

  // Basic state
  const [searchTerm, setSearchTerm] = useState("");

  // Object state
  const [profile, setProfile] = useState({
    firstName: "James",
    lastName: "King",
    email: "james@example.com"
  });

  // Array state
  const [notifications, setNotifications] = useState([
    "Welcome to the app",
    "Your profile is 80% complete"
  ]);

  // Async state
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userLoadError, setUserLoadError] = useState(null);

  // Reducer-managed state
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  // Ref stores mutable values without causing rerenders
  const searchInputRef = useRef(null);

  useDocumentTitle(`${APP_NAME} - Dashboard`);

  /* --------------------------------------------------------------------------
   * Memoized derived state
   * --------------------------------------------------------------------------
   * useMemo avoids recalculating unless dependencies change.
   */
  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter(product =>
      product.name.toLowerCase().includes(normalizedSearch)
    );
  }, [searchTerm]);

  const cartTotal = useMemo(() => {
    const subtotal = cartState.items.reduce((sum, item) => sum + item.price, 0);
    return subtotal - cartState.discount;
  }, [cartState.items, cartState.discount]);

  /* --------------------------------------------------------------------------
   * Memoized callbacks
   * --------------------------------------------------------------------------
   * useCallback is helpful when passing functions to child components.
   */
  const handleAddToCart = useCallback(product => {
    dispatch({ type: "ADD_ITEM", payload: product });
  }, []);

  const handleRemoveFromCart = useCallback(productId => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  }, []);

  const handleApplyDiscount = useCallback(() => {
    dispatch({ type: "SET_DISCOUNT", payload: 10 });
  }, []);

  /* --------------------------------------------------------------------------
   * Side effects with useEffect
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setIsLoadingUsers(true);
        setUserLoadError(null);

        const data = await fetchUsers();

        if (isMounted) {
          setUsers(data);
        }
      } catch (error) {
        if (isMounted) {
          setUserLoadError(error.message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    }

    loadUsers();

    // Cleanup prevents state updates if component unmounts before completion
    return () => {
      isMounted = false;
    };
  }, []);

  /* --------------------------------------------------------------------------
   * Event handlers
   * --------------------------------------------------------------------------
   */

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
  };

  const handleAddNotification = () => {
    const nextMessage = `Notification ${notifications.length + 1}`;

    // Immutable array update
    setNotifications(currentNotifications => [
      ...currentNotifications,
      nextMessage
    ]);
  };

  const handleUpdateEmail = () => {
    // Immutable object update
    setProfile(currentProfile => ({
      ...currentProfile,
      email: "updated-email@example.com"
    }));
  };

  /* --------------------------------------------------------------------------
   * Derived values using destructuring and template literals
   * --------------------------------------------------------------------------
   */

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const firstUserEmail = users[0]?.email ?? "No loaded user yet";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 20,
        maxWidth: 900,
        margin: "0 auto"
      }}
    >
      <header>
        <h1>{formatTitle(APP_NAME, APP_VERSION)}</h1>
        <p>Current theme: {theme}</p>
        <button onClick={toggleTheme}>Toggle theme</button>
      </header>

      <hr />

      <section>
        <h2>Profile</h2>
        <p>Name: {fullName}</p>
        <p>Email: {profile.email}</p>
        <button onClick={handleUpdateEmail}>Update email</button>
      </section>

      <hr />

      <section>
        <h2>Search Products</h2>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by product name"
        />
        <button onClick={handleFocusSearch}>Focus search input</button>

        <div style={{ marginTop: 12 }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <p>No products match "{searchTerm}"</p>
          )}
        </div>
      </section>

      <hr />

      <section>
        <h2>Notifications</h2>
        <button onClick={handleAddNotification}>Add notification</button>
        <ul>
          {notifications.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      </section>

      <hr />

      <section>
        <h2>Cart</h2>
        <button onClick={handleApplyDiscount}>Apply £10 Discount</button>

        {cartState.items.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <ul>
              {cartState.items.map(item => (
                <li key={`${item.id}-${Math.random()}`}>
                  {item.name} - {formatCurrency(item.price)}{" "}
                  <button onClick={() => handleRemoveFromCart(item.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p>Discount: {formatCurrency(cartState.discount)}</p>
            <p>Total: {formatCurrency(cartTotal)}</p>
          </>
        )}
      </section>

      <hr />

      <section>
        <h2>Async Data Loading</h2>

        {isLoadingUsers && <p>Loading users...</p>}

        {userLoadError && <p>Error loading users: {userLoadError}</p>}

        {!isLoadingUsers && !userLoadError && (
          <>
            <p>First loaded user email: {firstUserEmail}</p>
            <ul>
              {users.slice(0, 5).map(loadedUser => (
                <li key={loadedUser.id}>
                  {loadedUser.name} - {loadedUser.email}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

/* ============================================================================
 * 13. Root app component
 * ============================================================================
 */

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

/* ============================================================================
 * 14. Additional ESNext concept notes
 * ============================================================================
 *
 * Concepts shown in this file:
 *
 * - import / export
 * - const / let
 * - arrow functions
 * - template literals
 * - object and array destructuring
 * - rest parameters
 * - spread syntax
 * - optional chaining
 * - nullish coalescing
 * - map / filter / reduce / find
 * - default parameters
 * - async / await
 * - try / catch / finally pattern via async handling
 * - React function components
 * - props
 * - conditional rendering
 * - list rendering
 * - keys
 * - useState
 * - useEffect
 * - useMemo
 * - useCallback
 * - useRef
 * - useReducer
 * - Context API
 * - custom hooks
 * - immutable state updates
 *
 * Important real-world note:
 * In production React code, do not use Math.random() for keys because keys
 * must be stable across renders. It is used here only to keep the example
 * compact. In a real app, use a real stable ID.
 */
```

A better next step would be for me to turn this into a **real project-ready file structure** with `App.jsx`, `components/`, `hooks/`, `context/`, and `services/`.
