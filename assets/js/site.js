(function () {
  var sel = document.getElementById("topic");
  if (!sel) return;
  var map = {
    nolan: "N.O.L.A.N.™",
    kannon: "Kannon™",
    life: "L.I.F.E.™",
    missions: "Missions"
  };
  var key = new URLSearchParams(location.search).get("topic");
  if (key && map[key]) sel.value = map[key];
})();
