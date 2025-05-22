document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".toggle");
  const bioWeight = document.getElementById("bioWeight");
  const nonbioWeight = document.getElementById("nonbioWeight");
  const foodWeight = document.getElementById("foodWeight");

  const bioLabel = document.getElementById("bioLabel");
  const nonbioLabel = document.getElementById("nonbioLabel");
  const foodLabel = document.getElementById("foodLabel");

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const formattedMonth = today.toLocaleDateString("en-US", { month: "long" });
  const weekOfMonth = getWeekOfMonth(today);
  const weekOfMonthSuffix = getNumberSuffix(weekOfMonth);

  const data = {
    day: {
      bio: "2 kg",
      nonbio: "1.3 kg",
      food: "0.5 kg",
      label: `For the day of ${formattedDate}`
    },
    week: {
      bio: "9 kg",
      nonbio: "4.7 kg",
      food: "2.1 kg",
      label: `For the ${weekOfMonth}${weekOfMonthSuffix} week of ${formattedMonth}`
    },
    month: {
      bio: "32 kg",
      nonbio: "18 kg",
      food: "7.5 kg",
      label: `For the month of ${formattedMonth}`
    }
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const period = button.getAttribute("data-period");
      const selected = data[period];

      bioWeight.textContent = selected.bio;
      nonbioWeight.textContent = selected.nonbio;
      foodWeight.textContent = selected.food;

      bioLabel.textContent = selected.label;
      nonbioLabel.textContent = selected.label;
      foodLabel.textContent = selected.label;
    });
  });

  // Calculate week of the month for a date
  function getWeekOfMonth(date) {
    const dayOfMonth = date.getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayWeekday = firstDay.getDay() || 7; // Sunday as 7
    // Calculate adjusted day number counting week start Monday
    return Math.ceil((dayOfMonth + firstDayWeekday - 1) / 7);
  }

  // Returns suffix for numbers: 1 -> 'st', 2 -> 'nd', 3 -> 'rd', others -> 'th'
  function getNumberSuffix(number) {
    if (number >= 11 && number <= 13) return "th";
    switch (number % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }
});
