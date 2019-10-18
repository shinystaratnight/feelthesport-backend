const router = require("express").Router();
const database = require("../../database");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    reviewsPage: Joi.number()
      .integer()
      .min(1)
      .required()
  })
  .required();

router.get("/reviews/:id/:page", async (req, res) => {
  const arenaId = Number(req.params.id);
  const reviewsPage = Number(req.params.page);

  console.log("arenaId", arenaId, reviewsPage);

  const validatedParam = Joi.validate({ arenaId, reviewsPage }, schema);
  if (validatedParam.error) return res.status(400).send("Bad Request");

  const client = await database.connect();
  try {
    const reviewsInfo = (await client.query(
      /* SQL */ `
      SELECT
      (
        SELECT
          COUNT(*)
        FROM
          reviews
        WHERE
          arena = arenas.id
      )::SMALLINT as "ratingCount",
      (
        SELECT
          COUNT(*)
        FROM
          reviews
        WHERE
          body IS NOT NULL
          AND arena = arenas.id
      )::SMALLINT as "reviewCount",
      (
        SELECT
          CASE WHEN arenas.show_rating THEN (
            SELECT
              TRUNC(
                ROUND(
                  (
                    SUM(reviews.rating)::DECIMAL / COUNT(reviews.rating)::DECIMAL
                  ) * 2
                ) / 2,
                1
              )
            FROM
              reviews
            WHERE
              reviews.arena = arenas.id
          ) ELSE NULL END
      )::REAL as "rating",
      (
        SELECT
          JSON_AGG(
            JSON_STRIP_NULLS(
              JSON_BUILD_OBJECT(
                'reviewer',
                (
                  SELECT
                    name
                  FROM
                    users
                  WHERE
                    id = review.reviewer
                ),
                'body',
                review.body,
                'rating',
                review.rating,
                'reply',
                (
                  SELECT
                    JSON_BUILD_OBJECT(
                      'replier',
                      replier,
                      'body',
                      body
                    )
                  FROM
                    replies
                  WHERE
                    id = review.id
                )
              )
            )
          )
        FROM
          (
            SELECT
              id,
              reviewer,
              body,
              rating
            FROM
              reviews
            WHERE
              body IS NOT NULL
              AND arena = arenas.id
            ORDER BY
              created_at DESC
            LIMIT
              5
            OFFSET
              $2
          ) as review
      ) as "reviews"
      FROM
        arenas
      WHERE
        arenas.id = $1
      `,
      [arenaId, (reviewsPage - 1) * 5]
    )).rows[0];

    if (!reviewsInfo) return res.status(404).send("reviews not found");

    res.json({
      ratingCount: reviewsInfo.ratingCount,
      reviewCount: reviewsInfo.reviewCount,
      rating: reviewsInfo.rating,
      reviews: reviewsInfo.reviews
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
