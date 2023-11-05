

const checkFollow = (follower_id: String, following_id: String) :String=>{
    
    return `
    MATCH (follower:User {user_id: "${follower_id}"})
    MATCH (following:User {user_id: "${following_id}"})
    
    OPTIONAL MATCH (follower)-[follow:FOLLOW]->(following)
    
    WITH follower, following, CASE
      WHEN follow IS NOT NULL THEN true
      ELSE false
    END AS isFollowing
    
    CALL apoc.do.when(
      isFollowing,
      'MATCH (follower)-[follow:FOLLOW]->(following) DELETE follow RETURN false AS action',
      'MERGE (follower)-[:FOLLOW]->(following) RETURN true AS action',
      {follower: follower, following: following}
    ) YIELD value
    
    RETURN value.action AS action
    `;
}

export default checkFollow;