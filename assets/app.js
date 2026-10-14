(() => {
  "use strict";
  const countdown = document.querySelector(".countdown");
  if (countdown) {
    const target = new Date(countdown.dataset.target).getTime();
    const fields = {
      days: document.getElementById("days"),
      hours: document.getElementById("hours"),
      minutes: document.getElementById("minutes"),
      seconds: document.getElementById("seconds")
    };
    const updateCountdown = () => {
      let remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const values = {
        days: Math.floor(remaining / 86400),
        hours: Math.floor((remaining % 86400) / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60
      };
      Object.keys(fields).forEach(key => {
        if (fields[key]) fields[key].textContent = String(values[key]).padStart(2, "0");
      });
      if (remaining <= 0) {
        const heading = document.getElementById("countdown-heading");
        if (heading) heading.textContent = "Hội thao đã bắt đầu";
      }
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

})();