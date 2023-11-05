

const checkLike = (user_id: String, post_id: String) :String=>{
    return `
        MATCH (user:User {user_id: "${user_id}"})
        MATCH (post:Post {post_id: "${post_id}"})

        OPTIONAL MATCH (user)-[like:LIKE]->(post)

        WITH user, post, CASE
        WHEN like IS NOT NULL THEN true
        ELSE false
        END AS hasLiked

        CALL apoc.do.when(
        hasLiked,
        'MATCH (user)-[like:LIKE]->(post) DELETE like RETURN false AS action',
        'MERGE (user)-[:LIKE]->(post) RETURN true AS action',
        {user: user, post: post}
        ) YIELD value

        RETURN value.action AS action
    `;
}

export default checkLike;