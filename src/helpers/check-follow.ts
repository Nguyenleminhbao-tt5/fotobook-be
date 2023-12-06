

const checkFollow = (follower_id: String, following_id: String) :String=>{
    
    return `
    MATCH (follower:User {user_id: "${follower_id}"})
    MATCH (following:User {user_id: "${following_id}"})
    
    OPTIONAL MATCH (following)-[follow:FOLLOW]->(follower)
    
    WITH follower, following, CASE
      WHEN follow IS NOT NULL THEN true
      ELSE false
    END AS isFollowing
    
    CALL apoc.do.when(
      isFollowing,
      'MATCH (following)-[follow:FOLLOW]->(follower) DELETE follow RETURN false AS action',
      'MERGE (following)-[:FOLLOW]->(follower) RETURN true AS action',
      {follower: follower, following: following}
    ) YIELD value
    
    RETURN value.action AS action
    `;
}

export default checkFollow;


