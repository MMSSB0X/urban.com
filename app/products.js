export const products = [
    {
        id: "tomato-01",
        category: "Vegetables",
        name: "Vine-Ripened Organic Tomatoes",
        farm: "Green Valley Garden",
        badge: "Organic",
        badgeColor: "green",
        price: 4.50,
        unit: "500g Bunch",
        image: "images/products/tomato.avif", // Make sure this image exists locally
        images: [
            "images/products/tomato.avif",
            "images/products/tomato-2.jpg",
            "images/products/tomato-3.jpg"
        ],
        desc: "Our vine-ripened tomatoes are grown without any synthetic pesticides. They are sweet, juicy, and perfect for fresh salads or homemade sauces.",
        nutri: "Calories: 18 per 100g <br/> Vitamin C: 14mg <br/> Potassium: 237mg",
        farmDesc: "Green Valley Garden is a sustainable urban farm located just 2 miles away. We use rainwater harvesting and organic compost."
    },
    {
        id: "tomato-01",
        category: "Vegetables",
        name: "Vine-Ripened Organic Tomatoes",
        farm: "Green Valley Garden",
        badge: "Organic",
        badgeColor: "green",
        price: 4.50,
        unit: "500g Bunch",
        image: "images/products/tomato.avif", // Make sure this image exists locally
        images: [
            "images/products/tomato.avif",
            "images/products/tomato-2.jpg",
            "images/products/tomato-3.jpg"
        ],
        desc: "Our vine-ripened tomatoes are grown without any synthetic pesticides. They are sweet, juicy, and perfect for fresh salads or homemade sauces.",
        nutri: "Calories: 18 per 100g <br/> Vitamin C: 14mg <br/> Potassium: 237mg",
        farmDesc: "Green Valley Garden is a sustainable urban farm located just 2 miles away. We use rainwater harvesting and organic compost."
    }

    // {
    //     id: "kale-01",
    //     name: "Curly Kale",
    //     farm: "Urban Oasis",
    //     badge: "Fresh",
    //     badgeColor: "blue",
    //     price: 3.25,
    //     unit: "200g Bag",
    //     image: "images/products/kale-main.jpg",
    //     images: [
    //         "images/products/kale-main.jpg"
    //     ],
    //     desc: "Crisp, hydroponically grown curly kale. Perfect for smoothies, salads, or baking into healthy kale chips.",
    //     nutri: "Calories: 33 per 100g <br/> Vitamin K: 681% DV <br/> Vitamin A: 206% DV",
    //     farmDesc: "Urban Oasis uses vertical hydroponic towers to save 90% more water than traditional farming."
    // }
];

export function getProductById(id) {
    return products.find(p => p.id === id);
}