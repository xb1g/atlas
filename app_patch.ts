      // Fetch live-mined opportunities plan
      const resp = await fetch("/api/opportunities/plan");
      const minedData = await resp.json();

      // Shorten the wait time to just 1s to feel fast but still show logs
      setTimeout(() => {
        clearInterval(interval);
        setSession((prev: any) => ({
          ...prev,
          answers,
          opportunities: minedData.opportunities
        }));
        setLoading(false);
        setView("MENU");

        // Kick off progressive building for any planned opportunity
        if (minedData.opportunities && Array.isArray(minedData.opportunities)) {
          minedData.opportunities.forEach((opp: any) => {
            if (opp.status === "planned") {
              fetch("/api/opportunities/build", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ opportunityId: opp.id }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.opportunity) {
                    setSession((prev: any) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        opportunities: prev.opportunities.map((o: any) =>
                          o.id === data.opportunity.id ? data.opportunity : o
                        ),
                      };
                    });
                  }
                })
                .catch((e) => console.error("Failed building opportunity", e));
            }
          });
        }
      }, 1500);
