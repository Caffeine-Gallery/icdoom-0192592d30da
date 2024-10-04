import Text "mo:base/Text";

import Array "mo:base/Array";
import Int "mo:base/Int";
import Order "mo:base/Order";

actor {
  // Stable variable to store high scores
  stable var highScores : [(Text, Int)] = [];

  // Maximum number of high scores to keep
  let MAX_HIGH_SCORES = 10;

  // Add a new high score and sort the list
  public func addHighScore(name : Text, score : Int) : async () {
    // Append the new score to the existing list
    let updatedScores = Array.append(highScores, [(name, score)]);
    
    // Sort the scores in descending order
    highScores := Array.sort(
      updatedScores,
      func (a : (Text, Int), b : (Text, Int)) : Order.Order {
        Int.compare(b.1, a.1)
      }
    );

    // Keep only the top scores
    if (highScores.size() > MAX_HIGH_SCORES) {
      highScores := Array.subArray(highScores, 0, MAX_HIGH_SCORES);
    };
  };

  // Retrieve the current list of high scores
  public query func getHighScores() : async [(Text, Int)] {
    highScores
  };
}
