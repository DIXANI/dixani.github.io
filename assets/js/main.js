/* =========================================================
   DIXANI — Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("toolSearch");
    const searchButton = document.getElementById("searchButton");

    function performSearch() {

        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            searchInput.focus();
            return;
        }

        /*
         * Tool search will be expanded as we add tools.
         * For now, direct users toward the tools section.
         */

        const toolKeywords = [
            "calculator",
            "inventory",
            "stock",
            "variance",
            "business",
            "template"
        ];

        const found = toolKeywords.some(function (keyword) {
            return query.includes(keyword);
        });

        if (found) {
            document.getElementById("tools").scrollIntoView({
                behavior: "smooth"
            });
        } else {
            alert(
                "We are building more tools for DIXANI. " +
                "Try searching for calculators, inventory, business tools or templates."
            );
        }
    }


    if (searchButton) {
        searchButton.addEventListener("click", performSearch);
    }


    if (searchInput) {

        searchInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                performSearch();
            }

        });

    }

});
