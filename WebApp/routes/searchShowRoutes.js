module.exports = function(database) {
    var response = {}

    response.getQuintileForCity = async function (req, res) {
        const cities = req.body.cities;
        var cityString = '(';
        cities.forEach((value) => {
            cityString += "'" + value.label + "', "
        });
        cityString = cityString.substring(0, cityString.length - 2);
        cityString += ")"
        console.log(cityString);
        const query = `WITH f(city, freq) AS ( 
            SELECT city, COUNT(*) as freq
            FROM Accident a
            GROUP BY city)
        SELECT ranks.city, ranks.rank 
        FROM 
        (SELECT city, FLOOR(1 + 5 * (row_number() OVER (ORDER BY freq) -1)/COUNT(*) OVER ()) AS rank
        FROM 
         f
        ) ranks
        WHERE ranks.city in ${cityString}`
        const response = await database.execute(query);
        res.send(response)     
    }

    response.getSharedCodes = async function (req, res) {
        const cities = req.body.cities;
        var cityString = "(";
        var numCities = 0
        var numCodes = req.body.numCodes;
        cities.forEach((value) => {
            numCities = numCities + 1;
            cityString += "'" + value.label + "',";
        });
        cityString = cityString.substring(0, cityString.length - 1);
        cityString += ")"

        const query = `
        WITH ranktable AS (
            SELECT sub.city, sub.code, sub.count, ROW_NUMBER() OVER (PARTITION BY city ORDER BY sub.count DESC) AS Rank
                FROM 
                    (SELECT C.city_name AS city, A.tmc AS code, COUNT(A.tmc) as count
                    FROM CITY C JOIN ACCIDENT A ON C.city_name = A.city
                    GROUP BY C.city_name, A.tmc) sub
        )

        SELECT main.city, main.code, main.Rank, main.count2
        FROM
            (SELECT ranktable.city, ranktable.code, ranktable.count, ranktable.Rank AS Rank, sub4.count2
            FROM ranktable
            JOIN (SELECT sub3.code, COUNT(sub3.city) AS count2
                FROM
                    (SELECT ranktable.city, ranktable.code, ranktable.count, ranktable.Rank AS Rank
                    FROM ranktable
                    ) sub3
                WHERE sub3.city in ${cityString} AND sub3.Rank <= ${numCodes}
                GROUP BY sub3.code) sub4 ON sub4.code = ranktable.code WHERE ranktable.Rank <= ${numCodes}
            ) main
        WHERE main.city in ${cityString}
        `
        const response = await database.execute(query);
        res.send(response);
    }

    return response

};