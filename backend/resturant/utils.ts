import Chance from "chance";

const chance = new Chance();

export function generateOpeningHours() {
   const openingHour = chance.hour({ twentyfour: false });
   const closingHour = chance.hour({ twentyfour: false });

   const openingMinute = chance.minute();
   const closingMinute = chance.minute();

   const openingPeriod = chance.ampm();
   const closingPeriod = chance.ampm();

   const formattedOpeningHour = `${openingHour}:${openingMinute < 10 ? "0" : ""}${openingMinute} ${openingPeriod.toUpperCase()}`;
   const formattedClosingHour = `${closingHour}:${closingMinute < 10 ? "0" : ""}${closingMinute} ${closingPeriod.toUpperCase()}`;

   return `${formattedOpeningHour} - ${formattedClosingHour}`;
}


export function generateRestaurantNames(n: number) {
   const foodAdjectives = ["Tasty", "Delicious", "Savory", "Spicy", "Sweet", "Zesty", "Yummy", "Gourmet"];
   const foodNouns = ["Bistro", "Café", "Grill", "Kitchen", "Tavern", "Diner", "Eatery", "Joint"];

   const restaurantNames = [];
   for (let i = 0; i < n; i++) {
      const adjective = foodAdjectives[Math.floor(Math.random() * foodAdjectives.length)];
      const noun = foodNouns[Math.floor(Math.random() * foodNouns.length)];
      const name = `${adjective} ${noun}`;
      restaurantNames.push(name);
   }
   return restaurantNames;
}

