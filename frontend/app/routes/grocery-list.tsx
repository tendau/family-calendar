import { useState } from "react";
import { MdShoppingCart, MdAdd, MdCheck, MdDelete, MdEdit, MdLocalGroceryStore } from "react-icons/md";
import styles from "./grocery-list.module.css";

interface GroceryItem {
  id: number;
  name: string;
  category: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function GroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([
    { id: 1, name: "Milk", category: "Dairy", completed: false, priority: "high" },
    { id: 2, name: "Bread", category: "Bakery", completed: false, priority: "medium" },
    { id: 3, name: "Apples", category: "Produce", completed: true, priority: "low" },
    { id: 4, name: "Chicken Breast", category: "Meat", completed: false, priority: "high" },
    { id: 5, name: "Rice", category: "Pantry", completed: false, priority: "medium" },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Produce");
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>("medium");
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const categories = [
    { name: "Produce", icon: "🥬", color: "#2ecc71" },
    { name: "Dairy", icon: "🥛", color: "#3498db" },
    { name: "Meat", icon: "🥩", color: "#e74c3c" },
    { name: "Bakery", icon: "🍞", color: "#f39c12" },
    { name: "Pantry", icon: "🏺", color: "#95a5a6" },
    { name: "Frozen", icon: "❄️", color: "#9b59b6" },
    { name: "Beverages", icon: "🥤", color: "#1abc9c" },
    { name: "Snacks", icon: "🍿", color: "#e67e22" },
  ];

  const addItem = () => {
    if (newItemName.trim()) {
      const newItem: GroceryItem = {
        id: Date.now(),
        name: newItemName.trim(),
        category: selectedCategory,
        completed: false,
        priority: selectedPriority
      };
      setItems([...items, newItem]);
      setNewItemName("");
    }
  };

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const groupedItems = categories.reduce((acc, category) => {
    acc[category.name] = filteredItems.filter(item => item.category === category.name);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <MdShoppingCart className={styles.titleIcon} />
          Grocery List
        </h1>
        <div className={styles.stats}>
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {completedItems} of {totalItems} completed ({Math.round(progress)}%)
            </span>
          </div>
        </div>
      </div>

      <div className={styles.addSection}>
        <div className={styles.addForm}>
          <input
            type="text"
            placeholder="Add new item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className={styles.addInput}
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <select 
            value={selectedPriority} 
            onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
            className={styles.prioritySelect}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addItem} className={styles.addButton}>
            <MdAdd />
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All Items
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'pending' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`${styles.filterBtn} ${filter === 'completed' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className={styles.categoriesContainer}>
        {categories.map(category => {
          const categoryItems = groupedItems[category.name];
          if (!categoryItems || categoryItems.length === 0) return null;

          return (
            <div key={category.name} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <span className={styles.categoryCount}>({categoryItems.length})</span>
              </div>
              
              <div className={styles.itemsList}>
                {categoryItems.map(item => (
                  <div 
                    key={item.id} 
                    className={`${styles.item} ${item.completed ? styles.itemCompleted : ''} ${styles[`priority${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}`]}`}
                  >
                    <button 
                      onClick={() => toggleItem(item.id)}
                      className={styles.checkButton}
                    >
                      <MdCheck />
                    </button>
                    <span className={styles.itemName}>{item.name}</span>
                    <div className={styles.itemActions}>
                      <span className={`${styles.priorityBadge} ${styles[`priority${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}Badge`]}`}>
                        {item.priority}
                      </span>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className={styles.deleteButton}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.comingSoon}>
        <div className={styles.comingSoonCard}>
          <h2><MdLocalGroceryStore /> Coming Soon!</h2>
          <p>Enhanced grocery list features in development:</p>
          <ul>
            <li>Share lists with family members</li>
            <li>Price tracking and budgeting</li>
            <li>Store layout optimization</li>
            <li>Recipe integration</li>
            <li>Barcode scanning</li>
            <li>Smart suggestions based on history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
