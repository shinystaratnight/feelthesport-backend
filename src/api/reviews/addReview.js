const router = require("express").Router();
const database = require("../../database");
const validate = require("../../helpers/validate");
const Joi = require("joi");

const schema = Joi.object()
  .keys({
    arenaId: Joi.number()
      .integer()
      .min(1)
      .required(),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required(),
    body: Joi.string()
      .min(10)
      .max(250)
      .optional()
  })
  .required();

router.post("/reviews", validate(schema), async (req, res) => {
  const client = await database.connect();
  try {
    const { arenaId, rating, body } = req.body;

    await client.query(
      /* SQL */ `
      INSERT INTO
        reviews (arena, reviewer, rating, body)
      VALUES
        ($1, $2, $3, $4)`,
      [arenaId, req.user.id, rating, body]
    );

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
          ) as review
      ) as "reviews"
      FROM
        arenas
      WHERE
        arenas.id = $1
      `,
      [arenaId]
    )).rows[0];

    const { numOfUserArenaReviews } = (await client.query(
      /* SQL */ `
      SELECT
        COUNT(*) as "numOfUserArenaReviews"
      FROM
        reviews
      WHERE
        reviewer = $1
        AND arena = $2
      `,
      [req.user.id, arenaId]
    )).rows[0];

    const { numOfUserArenaTransactions } = (await client.query(
      /* SQL */ `
      SELECT
        COUNT(transaction_items.id) as "numOfUserArenaTransactions"
      FROM
        transactions
        JOIN transaction_items ON transaction_items.transaction = transactions.id
        JOIN arena_time_slots ON arena_time_slots.id = transaction_items.bookaslot_slot
        JOIN arena_bookaslots ON arena_bookaslots.id = arena_time_slots.bookaslot
      WHERE
        transactions.user_id = $1
        AND arena_bookaslots.arena = $2
      `,
      [req.user.id, arenaId]
    )).rows[0];

    let canReview = false;
    if (numOfUserArenaTransactions > numOfUserArenaReviews) canReview = true;

    res.json({
      ratingCount: reviewsInfo.ratingCount,
      reviewCount: reviewsInfo.reviewCount,
      rating: reviewsInfo.rating,
      reviews: reviewsInfo.reviews,
      canReview
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

module.exports = router;
