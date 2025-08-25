import { useState } from "react";
import { MdCelebration, MdMovie, MdMusicNote, MdSportsEsports, MdRestaurant, MdAirplanemodeActive } from "react-icons/md";
import styles from "./fun.module.css";

export default function Fun() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: "movies",
      name: "Movies & Shows",
      icon: <MdMovie />,
      color: "#e74c3c",
      items: ["Movie Night", "Netflix Binge", "Theater Visit", "Documentary Night"]
    },
    {
      id: "music",
      name: "Music & Events",
      icon: <MdMusicNote />,
      color: "#9b59b6",
      items: ["Concert", "Music Festival", "Karaoke Night", "Live Music"]
    },
    {
      id: "games",
      name: "Games & Activities",
      icon: <MdSportsEsports />,
      color: "#3498db",
      items: ["Board Game Night", "Video Games", "Outdoor Games", "Puzzle Time"]
    },
    {
      id: "dining",
      name: "Dining & Food",
      icon: <MdRestaurant />,
      color: "#f39c12",
      items: ["Restaurant Visit", "Cooking Together", "Food Festival", "Picnic"]
    },
    {
      id: "travel",
      name: "Travel & Adventures",
      icon: <MdAirplanemodeActive />,
      color: "#2ecc71",
      items: ["Day Trip", "Weekend Getaway", "Vacation Planning", "Local Exploration"]
    },
    {
      id: "celebrations",
      name: "Celebrations",
      icon: <MdCelebration />,
      color: "#e67e22",
      items: ["Birthday Party", "Anniversary", "Holiday Celebration", "Achievement Party"]
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <MdCelebration className={styles.titleIcon} />
          Fun Activities
        </h1>
        <p className={styles.subtitle}>Plan and track your family's fun activities and entertainment</p>
      </div>

      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.categoryCardActive : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            style={{ '--category-color': category.color } as React.CSSProperties}
          >
            <div className={styles.categoryHeader}>
              <div className={styles.categoryIcon} style={{ color: category.color }}>
                {category.icon}
              </div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </div>
            
            {selectedCategory === category.id && (
              <div className={styles.categoryItems}>
                {category.items.map((item, index) => (
                  <div key={index} className={styles.categoryItem}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.comingSoon}>
        <div className={styles.comingSoonCard}>
          <h2>🚧 Coming Soon!</h2>
          <p>This page is under construction. Soon you'll be able to:</p>
          <ul>
            <li>Create and track fun activity plans</li>
            <li>Set reminders for special events</li>
            <li>Share activities with family members</li>
            <li>Rate and review completed activities</li>
            <li>Get personalized activity recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
