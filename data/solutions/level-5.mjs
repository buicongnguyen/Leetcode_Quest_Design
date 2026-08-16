export default {
  "355": {
    inputModel: "The constructor starts an empty service. Calls then publish a unique tweet, add or remove a directed follow edge, or ask for one user's ten newest visible tweet IDs.",
    outputModel: "Mutation calls return nothing. getNewsFeed returns at most ten tweet IDs ordered by global posting time from newest to oldest, considering the user and current followees.",
    example: {
      input: "Twitter(), postTweet(7,41), postTweet(8,90), follow(7,8), getNewsFeed(7), postTweet(7,42), getNewsFeed(7), unfollow(7,8), getNewsFeed(7)",
      output: "null, null, null, null, [90,41], null, [42,90,41], null, [42,41]",
      trace: [
        { call: "postTweet(7,41); postTweet(8,90)", state: "timeline 7 ends at time 0; timeline 8 ends at time 1", result: "null" },
        { call: "follow(7,8); getNewsFeed(7)", state: "visible sources are users 7 and 8", result: "[90,41]" },
        { call: "postTweet(7,42); getNewsFeed(7)", state: "tweet 42 is now the newest head across both sources", result: "[42,90,41]" },
        { call: "unfollow(7,8); getNewsFeed(7)", state: "timeline 8 is no longer visible", result: "[42,41]" }
      ]
    },
    intuition: "Each user's posts are already a time-sorted stream. A feed is therefore not a scan of every tweet: it is a k-way merge of the newest element from the user and each current followee. A max-heap reveals the next globally newest candidate and only ten candidates need to be emitted.",
    approach: [
      "Give every post a strictly increasing timestamp and append it to the author's timeline.",
      "Store follow relationships as hash sets so duplicate follows are harmless and removal is direct.",
      "For a feed, seed a max-heap with the newest post from each visible timeline; after consuming one post, push the previous post from that same timeline.",
      "Stop after ten pops or when the heap becomes empty."
    ],
    invariants: [
      "A user's timeline is in strictly increasing timestamp order.",
      "The heap contains the newest not-yet-consumed post from every visible timeline that still has one.",
      "After i heap pops, the result contains exactly the i newest visible tweets in correct order."
    ],
    diagram: {
      caption: "News-feed construction is a bounded merge of sorted per-user timelines.",
      nodes: [
        { id: "self", label: "user timeline" },
        { id: "followees", label: "followee timelines" },
        { id: "heap", label: "max-heap by timestamp" },
        { id: "feed", label: "up to 10 tweet IDs" }
      ],
      edges: [
        { from: "self", to: "heap", label: "newest post" },
        { from: "followees", to: "heap", label: "one head each" },
        { from: "heap", to: "feed", label: "pop newest, advance source" }
      ]
    },
    pseudocode: `postTweet(user, tweet):
  append (nextTime, tweet) to posts[user]

getNewsFeed(user):
  sources = followees[user] union {user}
  for each source with posts:
    push its newest post into maxHeap
  while heap not empty and answer has fewer than 10 items:
    pop newest (time, tweet, source, index)
    append tweet to answer
    if source has an earlier post:
      push that post
  return answer`,
    proof: [
      "Initially, the newest item of every eligible timeline is in the heap, so the heap maximum is the newest visible tweet overall.",
      "After popping a timeline's head, inserting its immediately preceding post restores the same property; induction proves every emitted tweet is the next newest one.",
      "The loop stops only after ten correct tweets or exhaustion of all visible timelines, which exactly matches the requested feed."
    ],
    complexity: [
      { operation: "postTweet / follow / unfollow", time: "O(1) average", reason: "They append to a list or update a hash set." },
      { operation: "getNewsFeed", time: "O((F + 10) log(F + 1))", reason: "F visible followee timelines are seeded and at most ten heap entries are consumed." },
      { operation: "Storage", time: "O(T + E)", reason: "All T tweets and E follow edges are retained." }
    ],
    python: `from collections import defaultdict
import heapq
from typing import List


class Twitter:
    def __init__(self):
        self.time = 0
        self.posts = defaultdict(list)
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.posts[userId].append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId: int) -> List[int]:
        heap = []
        sources = set(self.following[userId])
        sources.add(userId)

        for source in sources:
            if self.posts[source]:
                index = len(self.posts[source]) - 1
                time, tweet = self.posts[source][index]
                heapq.heappush(heap, (-time, tweet, source, index))

        answer = []
        while heap and len(answer) < 10:
            neg_time, tweet, source, index = heapq.heappop(heap)
            answer.append(tweet)
            index -= 1
            if index >= 0:
                time, previous_tweet = self.posts[source][index]
                heapq.heappush(
                    heap, (-time, previous_tweet, source, index)
                )
        return answer

    def follow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`,
    cpp: `#include <queue>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
using namespace std;

class Twitter {
    int timer = 0;
    unordered_map<int, vector<pair<int, int>>> posts;
    unordered_map<int, unordered_set<int>> following;

public:
    Twitter() = default;

    void postTweet(int userId, int tweetId) {
        posts[userId].push_back({timer++, tweetId});
    }

    vector<int> getNewsFeed(int userId) {
        // (time, tweet, author, index); priority_queue puts newest first.
        priority_queue<tuple<int, int, int, int>> heap;
        unordered_set<int> sources = following[userId];
        sources.insert(userId);

        for (int source : sources) {
            auto it = posts.find(source);
            if (it == posts.end() || it->second.empty()) continue;
            int index = static_cast<int>(it->second.size()) - 1;
            auto [time, tweet] = it->second[index];
            heap.push({time, tweet, source, index});
        }

        vector<int> answer;
        while (!heap.empty() && answer.size() < 10) {
            auto [time, tweet, source, index] = heap.top();
            heap.pop();
            answer.push_back(tweet);
            if (--index >= 0) {
                auto [previousTime, previousTweet] = posts[source][index];
                heap.push({previousTime, previousTweet, source, index});
            }
        }
        return answer;
    }

    void follow(int followerId, int followeeId) {
        following[followerId].insert(followeeId);
    }

    void unfollow(int followerId, int followeeId) {
        following[followerId].erase(followeeId);
    }
};`
  },

  "1500": {
    inputModel: "The constructor gives the number of chunks. A joining user supplies the chunks already owned; later calls make a live user leave or request one chunk.",
    outputModel: "join returns the smallest unused positive user ID. request returns the current owners in ascending ID order and grants the chunk to the requester only when at least one owner exists; leave returns nothing.",
    example: {
      input: "FileSharing(5), join([2,5]), join([1,5]), request(2,2), leave(1), request(2,5), join([3])",
      output: "null, 1, 2, [1], null, [2], 1",
      trace: [
        { call: "join([2,5]); join([1,5])", state: "users 1->{2,5}, 2->{1,5}; chunk 5 owners={1,2}", result: "1, 2" },
        { call: "request(2,2)", state: "owner 1 serves chunk 2; user 2 gains it", result: "[1]" },
        { call: "leave(1); request(2,5)", state: "ID 1 is free; user 2 remains the only owner of chunk 5", result: "[2]" },
        { call: "join([3])", state: "the minimum released ID is assigned to the new user", result: "1" }
      ]
    },
    intuition: "The operations ask questions in both directions: leave needs every chunk of one user, while request needs every user of one chunk. Keeping both indexes makes either traversal touch only the relationships that matter. A min-heap handles reusable IDs, while a monotone counter supplies fresh IDs.",
    approach: [
      "Maintain userToChunks and chunkToUsers as mirrored hash-set indexes.",
      "On join, pop the smallest released ID if one exists; otherwise allocate the next never-used ID, then add every ownership edge to both indexes.",
      "On leave, traverse that user's chunks, remove the user from each reverse owner set, delete the user record, and push the ID into the free-ID heap.",
      "On request, sort the reverse owner set for output; if it is nonempty, insert the new ownership edge into both indexes."
    ],
    invariants: [
      "user is in chunkToUsers[chunk] exactly when chunk is in userToChunks[user].",
      "Every live ID is absent from the free heap, and every released ID in the heap is not live.",
      "The fresh-ID counter is larger than every ID ever allocated, so heap IDs are always preferred."
    ],
    diagram: {
      caption: "Two mirrored ownership indexes support opposite access paths.",
      nodes: [
        { id: "ids", label: "free-ID min-heap + next ID" },
        { id: "users", label: "user -> owned chunks" },
        { id: "chunks", label: "chunk -> owner users" },
        { id: "request", label: "sorted owner response" }
      ],
      edges: [
        { from: "ids", to: "users", label: "join allocates" },
        { from: "users", to: "chunks", label: "mirrored edge" },
        { from: "chunks", to: "request", label: "read and sort owners" },
        { from: "request", to: "users", label: "grant if available" }
      ]
    },
    pseudocode: `join(ownedChunks):
  id = pop freeIds if possible, otherwise nextId++
  userToChunks[id] = set(ownedChunks)
  for chunk in ownedChunks: chunkToUsers[chunk].add(id)
  return id

leave(id):
  for chunk in userToChunks[id]: chunkToUsers[chunk].remove(id)
  remove userToChunks[id]
  push id into freeIds

request(id, chunk):
  answer = sorted(chunkToUsers[chunk])
  if answer is not empty:
    add ownership (id, chunk) to both indexes
  return answer`,
    proof: [
      "Join and successful request add each ownership edge to both indexes, while leave removes it from both; therefore the mirrored-index invariant holds after every call.",
      "The free heap contains all and only reusable IDs, so its minimum is the smallest reusable ID; if it is empty, every smaller allocated ID is live and nextId is the smallest unused ID.",
      "request snapshots and sorts the owners before granting the chunk, so its return value describes ownership at request time exactly as required."
    ],
    complexity: [
      { operation: "join(c chunks)", time: "O(c + log U)", reason: "It installs c mirrored edges and may pop one of U reusable IDs." },
      { operation: "leave(c chunks)", time: "O(c + log U)", reason: "It removes exactly the departing user's c edges and releases one ID." },
      { operation: "request(o owners)", time: "O(o log o)", reason: "Owners are copied and sorted; the conditional ownership update is average O(1)." },
      { operation: "Storage", time: "O(U + R)", reason: "Live users and R ownership relationships are indexed in both directions." }
    ],
    python: `from collections import defaultdict
import heapq
from typing import List


class FileSharing:
    def __init__(self, m: int):
        self.next_id = 1
        self.free_ids = []
        self.user_to_chunks = {}
        self.chunk_to_users = defaultdict(set)

    def join(self, ownedChunks: List[int]) -> int:
        if self.free_ids:
            user_id = heapq.heappop(self.free_ids)
        else:
            user_id = self.next_id
            self.next_id += 1

        self.user_to_chunks[user_id] = set(ownedChunks)
        for chunk in ownedChunks:
            self.chunk_to_users[chunk].add(user_id)
        return user_id

    def leave(self, userID: int) -> None:
        for chunk in self.user_to_chunks[userID]:
            self.chunk_to_users[chunk].discard(userID)
        del self.user_to_chunks[userID]
        heapq.heappush(self.free_ids, userID)

    def request(self, userID: int, chunkID: int) -> List[int]:
        answer = sorted(self.chunk_to_users[chunkID])
        if answer:
            self.chunk_to_users[chunkID].add(userID)
            self.user_to_chunks[userID].add(chunkID)
        return answer`,
    cpp: `#include <algorithm>
#include <functional>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

class FileSharing {
    int nextId = 1;
    priority_queue<int, vector<int>, greater<int>> freeIds;
    unordered_map<int, unordered_set<int>> userToChunks;
    unordered_map<int, unordered_set<int>> chunkToUsers;

public:
    FileSharing(int m) {
        (void)m;
    }

    int join(vector<int> ownedChunks) {
        int userId;
        if (!freeIds.empty()) {
            userId = freeIds.top();
            freeIds.pop();
        } else {
            userId = nextId++;
        }

        userToChunks[userId] = {};
        for (int chunk : ownedChunks) {
            userToChunks[userId].insert(chunk);
            chunkToUsers[chunk].insert(userId);
        }
        return userId;
    }

    void leave(int userID) {
        for (int chunk : userToChunks[userID]) {
            chunkToUsers[chunk].erase(userID);
        }
        userToChunks.erase(userID);
        freeIds.push(userID);
    }

    vector<int> request(int userID, int chunkID) {
        vector<int> answer(chunkToUsers[chunkID].begin(),
                           chunkToUsers[chunkID].end());
        sort(answer.begin(), answer.end());
        if (!answer.empty()) {
            chunkToUsers[chunkID].insert(userID);
            userToChunks[userID].insert(chunkID);
        }
        return answer;
    }
};`
  },

  "1912": {
    inputModel: "The constructor receives shops and triples [shop, movie, price]. Calls search available copies of one movie, rent or return one known copy, and report globally rented copies.",
    outputModel: "search returns up to five shop IDs ordered by (price, shop). report returns up to five [shop, movie] pairs ordered by (price, shop, movie). State-changing calls return nothing.",
    example: {
      input: "MovieRentingSystem(4, [[0,7,8],[1,7,6],[2,7,6],[1,9,5],[3,9,4]]), search(7), rent(2,7), rent(3,9), report(), drop(3,9), search(9)",
      output: "null, [1,2,0], null, null, [[3,9],[2,7]], null, [3,1]",
      trace: [
        { call: "search(7)", state: "available keys=(6,1),(6,2),(8,0)", result: "[1,2,0]" },
        { call: "rent(2,7); rent(3,9)", state: "rented keys=(4,3,9),(6,2,7)", result: "null" },
        { call: "report()", state: "the global rented heap yields both live records by price", result: "[[3,9],[2,7]]" },
        { call: "drop(3,9); search(9)", state: "movie 9 availability is (4,3) then (5,1)", result: "[3,1]" }
      ]
    },
    intuition: "There are two rankings: available copies are ranked within one movie, while rented copies are ranked globally. Separate min-heaps match those read paths. Rent and drop create new state versions; storing a version in every heap record lets obsolete records be discarded lazily without an ordered-set dependency.",
    approach: [
      "Store the immutable price of each (shop, movie), its current rented flag, and a version number.",
      "Build one availability min-heap per movie ordered by (price, shop), plus one global rented min-heap ordered by (price, shop, movie).",
      "On rent or drop, increment that copy's version and push a new record into the destination heap; do not search a heap to erase the old record.",
      "Before using a heap top, reject it unless both its version and rented state match the current copy. Temporarily pop and restore at most five live records for search or report."
    ],
    invariants: [
      "For every copy, price never changes and version increases on every rent/drop transition.",
      "A heap record is live exactly when its stored version equals the copy's current version and its heap agrees with the rented flag.",
      "After stale tops are removed, each heap top is the smallest live key in that heap's requested ordering."
    ],
    diagram: {
      caption: "Versioned records move logically between per-movie availability and the global rented index.",
      nodes: [
        { id: "price", label: "(shop,movie) -> price/version/state" },
        { id: "available", label: "movie -> min-heap(price,shop)" },
        { id: "rented", label: "global min-heap(price,shop,movie)" },
        { id: "top5", label: "validated top 5" }
      ],
      edges: [
        { from: "price", to: "available", label: "initial or drop version" },
        { from: "price", to: "rented", label: "rent version" },
        { from: "available", to: "top5", label: "search(movie)" },
        { from: "rented", to: "top5", label: "report()" }
      ]
    },
    pseudocode: `initialize price, version=0, rented=false for each copy
push each copy into available[movie]

rent(shop, movie):
  rented[copy] = true; version[copy] += 1
  push (price, shop, movie, version) into global rented heap

drop(shop, movie):
  rented[copy] = false; version[copy] += 1
  push (price, shop, version) into available[movie]

search/report:
  discard top while its state or version is stale
  pop up to five live records, collect the requested fields
  push those live records back and return result`,
    proof: [
      "Every state transition creates a record carrying the unique current version, so all records from earlier states fail validation and can never enter an answer.",
      "Heap order places the smallest tuple first. Once stale tops are removed, repeated pops therefore enumerate live copies in exactly the required tie-breaking order.",
      "Temporarily restoring the selected live records leaves the index unchanged, so search and report are read-only and return precisely the first five eligible records."
    ],
    complexity: [
      { operation: "rent / drop", time: "O(log(E + Q))", reason: "Each transition pushes one record into a heap containing initial entries plus up to one lazy record per update." },
      { operation: "search / report", time: "O(5 log(E + Q)) amortized", reason: "At most five live records are popped and restored; each stale record is permanently popped once." },
      { operation: "Storage", time: "O(E + Q)", reason: "E initial records plus at most one lazy record per state-changing call are stored." }
    ],
    python: `from collections import defaultdict
import heapq
from typing import List


class MovieRentingSystem:
    def __init__(self, n: int, entries: List[List[int]]):
        self.price = {}
        self.version = {}
        self.rented = set()
        self.available = defaultdict(list)
        self.rented_heap = []

        for shop, movie, price in entries:
            key = (shop, movie)
            self.price[key] = price
            self.version[key] = 0
            heapq.heappush(self.available[movie], (price, shop, 0))

    def search(self, movie: int) -> List[int]:
        heap = self.available[movie]
        chosen = []
        while heap and len(chosen) < 5:
            price, shop, version = heapq.heappop(heap)
            key = (shop, movie)
            if key in self.rented or self.version[key] != version:
                continue
            chosen.append((price, shop, version))

        for record in chosen:
            heapq.heappush(heap, record)
        return [shop for _, shop, _ in chosen]

    def rent(self, shop: int, movie: int) -> None:
        key = (shop, movie)
        self.rented.add(key)
        self.version[key] += 1
        heapq.heappush(
            self.rented_heap,
            (self.price[key], shop, movie, self.version[key])
        )

    def drop(self, shop: int, movie: int) -> None:
        key = (shop, movie)
        self.rented.remove(key)
        self.version[key] += 1
        heapq.heappush(
            self.available[movie],
            (self.price[key], shop, self.version[key])
        )

    def report(self) -> List[List[int]]:
        chosen = []
        while self.rented_heap and len(chosen) < 5:
            price, shop, movie, version = heapq.heappop(self.rented_heap)
            key = (shop, movie)
            if key not in self.rented or self.version[key] != version:
                continue
            chosen.append((price, shop, movie, version))

        for record in chosen:
            heapq.heappush(self.rented_heap, record)
        return [[shop, movie] for _, shop, movie, _ in chosen]`,
    cpp: `#include <functional>
#include <queue>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

class MovieRentingSystem {
    using AvailableRecord = tuple<int, int, int>;       // price, shop, version
    using RentedRecord = tuple<int, int, int, int>;     // price, shop, movie, version

    unordered_map<long long, int> price;
    unordered_map<long long, int> version;
    unordered_set<long long> rented;
    unordered_map<int, priority_queue<AvailableRecord,
        vector<AvailableRecord>, greater<AvailableRecord>>> available;
    priority_queue<RentedRecord, vector<RentedRecord>,
                   greater<RentedRecord>> rentedHeap;

    static long long keyOf(int shop, int movie) {
        return (static_cast<long long>(shop) << 32) |
               static_cast<unsigned int>(movie);
    }

public:
    MovieRentingSystem(int n, vector<vector<int>>& entries) {
        (void)n;
        for (const auto& entry : entries) {
            int shop = entry[0], movie = entry[1], cost = entry[2];
            long long key = keyOf(shop, movie);
            price[key] = cost;
            version[key] = 0;
            available[movie].push({cost, shop, 0});
        }
    }

    vector<int> search(int movie) {
        auto& heap = available[movie];
        vector<AvailableRecord> chosen;
        while (!heap.empty() && chosen.size() < 5) {
            auto record = heap.top();
            heap.pop();
            auto [cost, shop, recordVersion] = record;
            long long key = keyOf(shop, movie);
            if (rented.count(key) || version[key] != recordVersion) continue;
            chosen.push_back(record);
        }

        vector<int> answer;
        for (const auto& record : chosen) {
            auto [cost, shop, recordVersion] = record;
            answer.push_back(shop);
            heap.push(record);
        }
        return answer;
    }

    void rent(int shop, int movie) {
        long long key = keyOf(shop, movie);
        rented.insert(key);
        int currentVersion = ++version[key];
        rentedHeap.push({price[key], shop, movie, currentVersion});
    }

    void drop(int shop, int movie) {
        long long key = keyOf(shop, movie);
        rented.erase(key);
        int currentVersion = ++version[key];
        available[movie].push({price[key], shop, currentVersion});
    }

    vector<vector<int>> report() {
        vector<RentedRecord> chosen;
        while (!rentedHeap.empty() && chosen.size() < 5) {
            auto record = rentedHeap.top();
            rentedHeap.pop();
            auto [cost, shop, movie, recordVersion] = record;
            long long key = keyOf(shop, movie);
            if (!rented.count(key) || version[key] != recordVersion) continue;
            chosen.push_back(record);
        }

        vector<vector<int>> answer;
        for (const auto& record : chosen) {
            auto [cost, shop, movie, recordVersion] = record;
            answer.push_back({shop, movie});
            rentedHeap.push(record);
        }
        return answer;
    }
};`
  },

  "2296": {
    inputModel: "The editor starts empty with one cursor. Calls insert a lowercase string at the cursor, backspace up to k characters, or move the cursor up to k positions left or right.",
    outputModel: "addText returns nothing; deleteText returns the actual deletion count; either cursor move returns at most the final ten characters immediately left of the cursor.",
    example: {
      input: "TextEditor(), addText(\"design\"), cursorLeft(2), addText(\"er\"), deleteText(3), cursorRight(5), cursorLeft(3)",
      output: "null, null, \"desi\", null, 3, \"desgn\", \"de\"",
      trace: [
        { call: "addText(\"design\"); cursorLeft(2)", state: "left=desi, right stack reconstructs gn", result: "desi" },
        { call: "addText(\"er\")", state: "document is desier|gn", result: "null" },
        { call: "deleteText(3); cursorRight(5)", state: "deleting ier leaves des|gn, then the cursor reaches the end", result: "3, desgn" },
        { call: "cursorLeft(3)", state: "document remains de|sgn", result: "de" }
      ]
    },
    intuition: "The cursor is a boundary, so represent the document as two stacks rather than one string. Characters left of the cursor end at the top of the left stack; characters right of it begin at the top of the right stack. Every edit then touches only stack ends.",
    approach: [
      "Store the prefix in normal order in left and store the suffix in reverse stack order in right.",
      "Insert by appending characters to left; backspace by removing up to k characters from left.",
      "Move left by transferring characters from left to right, and move right by transferring them back.",
      "Build the requested context from only the last ten characters in left."
    ],
    invariants: [
      "The complete document is left followed by reverse(right).",
      "The cursor is always between left and reverse(right), so its position equals len(left).",
      "The next character to the right of the cursor, when present, is at the top of right."
    ],
    diagram: {
      caption: "The cursor splits the text into two end-editable stacks.",
      nodes: [
        { id: "left", label: "left stack: ... a b" },
        { id: "cursor", label: "cursor boundary |" },
        { id: "right", label: "right stack top: c, then d ..." },
        { id: "context", label: "last 10 of left" }
      ],
      edges: [
        { from: "left", to: "right", label: "cursorLeft transfers top" },
        { from: "right", to: "left", label: "cursorRight transfers top" },
        { from: "left", to: "context", label: "return suffix" }
      ]
    },
    pseudocode: `addText(text): append every character to left

deleteText(k):
  removed = min(k, size(left))
  pop removed characters from left
  return removed

cursorLeft(k):
  repeat up to k while left is nonempty: right.push(left.pop())
  return suffix of left of length at most 10

cursorRight(k):
  repeat up to k while right is nonempty: left.push(right.pop())
  return suffix of left of length at most 10`,
    proof: [
      "Insertion and deletion change only the prefix immediately before the cursor, so appending to or popping from left produces the specified document.",
      "A cursor move transfers exactly the crossed character between stacks; left + reverse(right) is unchanged while the boundary moves one position.",
      "Because left is precisely the text before the cursor, its last min(10, len(left)) characters are exactly the required return value."
    ],
    complexity: [
      { operation: "addText / deleteText / cursor move", time: "O(k)", reason: "At most k inserted, deleted, or crossed characters are touched." },
      { operation: "Returned context", time: "O(1)", reason: "At most ten characters are copied." },
      { operation: "Storage", time: "O(n)", reason: "Every document character appears in exactly one of the two stacks." }
    ],
    python: `class TextEditor:
    def __init__(self):
        self.left = []
        self.right = []

    def addText(self, text: str) -> None:
        self.left.extend(text)

    def deleteText(self, k: int) -> int:
        removed = min(k, len(self.left))
        if removed:
            del self.left[-removed:]
        return removed

    def cursorLeft(self, k: int) -> str:
        for _ in range(min(k, len(self.left))):
            self.right.append(self.left.pop())
        return ''.join(self.left[-10:])

    def cursorRight(self, k: int) -> str:
        for _ in range(min(k, len(self.right))):
            self.left.append(self.right.pop())
        return ''.join(self.left[-10:])`,
    cpp: `#include <algorithm>
#include <string>
using namespace std;

class TextEditor {
    string leftPart;
    string rightStack;

    string context() const {
        int start = max(0, static_cast<int>(leftPart.size()) - 10);
        return leftPart.substr(start);
    }

public:
    TextEditor() = default;

    void addText(string text) {
        leftPart += text;
    }

    int deleteText(int k) {
        int removed = min(k, static_cast<int>(leftPart.size()));
        leftPart.resize(leftPart.size() - removed);
        return removed;
    }

    string cursorLeft(int k) {
        while (k-- > 0 && !leftPart.empty()) {
            rightStack.push_back(leftPart.back());
            leftPart.pop_back();
        }
        return context();
    }

    string cursorRight(int k) {
        while (k-- > 0 && !rightStack.empty()) {
            leftPart.push_back(rightStack.back());
            rightStack.pop_back();
        }
        return context();
    }
};`
  },

  "3484": {
    inputModel: "The constructor supplies the row count for a 26-column spreadsheet. Calls set or reset a cell such as A1, or evaluate a formula =X+Y where each operand is a cell reference or a non-negative integer.",
    outputModel: "setCell and resetCell return nothing. getValue returns the integer sum of the two operands, treating every never-set or reset cell as zero.",
    example: {
      input: "Spreadsheet(4), setCell(\"C3\",14), getValue(\"=C3+9\"), setCell(\"A4\",6), getValue(\"=A4+C3\"), resetCell(\"C3\"), getValue(\"=A4+C3\"), getValue(\"=100+25\")",
      output: "null, null, 23, null, 20, null, 6, 125",
      trace: [
        { call: "setCell(\"C3\",14); getValue(\"=C3+9\")", state: "C3 resolves to 14 and the literal resolves to 9", result: "23" },
        { call: "setCell(\"A4\",6); getValue(\"=A4+C3\")", state: "the two addressed cells contain 6 and 14", result: "20" },
        { call: "resetCell(\"C3\"); getValue(\"=A4+C3\")", state: "C3 returns to zero while A4 remains 6", result: "6" },
        { call: "getValue(\"=100+25\")", state: "both operands bypass the grid and parse as literals", result: "125" }
      ]
    },
    intuition: "Formulas are deliberately shallow: they contain exactly two operands and are not stored in cells. Therefore this is direct addressing plus token parsing, not a dependency graph. A cell reference converts to one column index and one 1-based row index.",
    approach: [
      "Allocate a 26 by (rows + 1) integer grid initialized to zero; the unused row zero makes reference parsing direct.",
      "Map a reference's first character to column 0..25 and parse the remaining digits as its row.",
      "Set and reset by direct assignment.",
      "For getValue, remove the leading equals sign, split once at plus, resolve each token as either digits or a cell, and add the values."
    ],
    invariants: [
      "grid[column][row] is exactly the current value of that spreadsheet cell.",
      "Every untouched or reset cell stores zero.",
      "Operand resolution has no side effects and returns either the parsed literal or one direct grid value."
    ],
    diagram: {
      caption: "A formula is parsed into two independent leaves and one addition node.",
      nodes: [
        { id: "formula", label: "=X+Y" },
        { id: "x", label: "resolve X: literal or cell" },
        { id: "y", label: "resolve Y: literal or cell" },
        { id: "sum", label: "integer X + Y" }
      ],
      edges: [
        { from: "formula", to: "x", label: "left token" },
        { from: "formula", to: "y", label: "right token" },
        { from: "x", to: "sum", label: "value" },
        { from: "y", to: "sum", label: "value" }
      ]
    },
    pseudocode: `cellValue(reference):
  column = reference[0] - 'A'
  row = integer(reference[1...])
  return grid[column][row]

resolve(token):
  if token begins with a digit: return integer(token)
  return cellValue(token)

getValue(formula):
  split formula without '=' at '+' into X and Y
  return resolve(X) + resolve(Y)`,
    proof: [
      "Direct indexing is a bijection between valid references and grid positions, so set and reset update exactly the named cell.",
      "Each valid operand is either a literal, which resolve parses unchanged, or a reference, whose current grid value resolve reads.",
      "The only formula operator is addition; adding the two correctly resolved operands therefore evaluates every accepted formula exactly."
    ],
    complexity: [
      { operation: "setCell / resetCell", time: "O(L)", reason: "Parsing a reference of L characters dominates one array assignment." },
      { operation: "getValue", time: "O(L)", reason: "The formula is split and its two tokens are parsed once." },
      { operation: "Storage", time: "O(rows)", reason: "There are exactly 26 columns for the configured number of rows." }
    ],
    python: `class Spreadsheet:
    def __init__(self, rows: int):
        self.cells = [[0] * (rows + 1) for _ in range(26)]

    def _position(self, cell: str):
        return ord(cell[0]) - ord('A'), int(cell[1:])

    def setCell(self, cell: str, value: int) -> None:
        column, row = self._position(cell)
        self.cells[column][row] = value

    def resetCell(self, cell: str) -> None:
        column, row = self._position(cell)
        self.cells[column][row] = 0

    def _value(self, token: str) -> int:
        if token[0].isdigit():
            return int(token)
        column, row = self._position(token)
        return self.cells[column][row]

    def getValue(self, formula: str) -> int:
        left, right = formula[1:].split('+')
        return self._value(left) + self._value(right)`,
    cpp: `#include <cctype>
#include <string>
#include <utility>
#include <vector>
using namespace std;

class Spreadsheet {
    vector<vector<int>> cells;

    pair<int, int> position(const string& cell) const {
        return {cell[0] - 'A', stoi(cell.substr(1))};
    }

    int value(const string& token) const {
        if (isdigit(static_cast<unsigned char>(token[0]))) {
            return stoi(token);
        }
        auto [column, row] = position(token);
        return cells[column][row];
    }

public:
    Spreadsheet(int rows) : cells(26, vector<int>(rows + 1, 0)) {}

    void setCell(string cell, int valueToSet) {
        auto [column, row] = position(cell);
        cells[column][row] = valueToSet;
    }

    void resetCell(string cell) {
        auto [column, row] = position(cell);
        cells[column][row] = 0;
    }

    int getValue(string formula) {
        size_t plus = formula.find('+');
        string left = formula.substr(1, plus - 1);
        string right = formula.substr(plus + 1);
        return value(left) + value(right);
    }
};`
  },

  "432": {
    inputModel: "The structure starts empty. inc raises a string key's count or creates it at one; dec lowers an existing key and removes it at zero; two queries request any minimum- or maximum-count key.",
    outputModel: "Updates return nothing. getMinKey and getMaxKey return any key from the corresponding count, or the empty string when no keys exist. Every operation must be average O(1).",
    example: {
      input: "AllOne(), inc(\"red\"), inc(\"red\"), inc(\"blue\"), inc(\"green\"), inc(\"green\"), inc(\"green\"), getMaxKey(), getMinKey(), dec(\"green\"), dec(\"blue\"), dec(\"green\"), getMaxKey(), getMinKey()",
      output: "null, null, null, null, null, null, null, \"green\", \"blue\", null, null, null, \"red\", \"green\"",
      trace: [
        { call: "inc(\"red\") twice", state: "buckets: 2->{red}", result: "null" },
        { call: "inc(\"blue\"); inc(\"green\") three times", state: "1->{blue} <-> 2->{red} <-> 3->{green}", result: "null" },
        { call: "getMaxKey(); getMinKey()", state: "the extreme buckets are counts 3 and 1", result: "green, blue" },
        { call: "dec(\"green\"); dec(\"blue\"); dec(\"green\")", state: "1->{green} <-> 2->{red}", result: "null" },
        { call: "getMaxKey(); getMinKey()", state: "red is uniquely maximal and green uniquely minimal", result: "red, green" }
      ]
    },
    intuition: "A key changes count by exactly one, so it only moves to a neighboring count bucket. Keep only nonempty buckets in increasing count order, store a hash set of tied keys inside each bucket, and map every key directly to its bucket. The first and last buckets then answer extrema immediately.",
    approach: [
      "Use a doubly linked list of nonempty buckets ordered by count, with sentinel nodes at both ends.",
      "Map each key to its current bucket; each bucket owns a hash set of all keys with that count.",
      "For inc, use or create the count+1 neighbor; for dec, use or create the count-1 neighbor, or remove a key whose old count is one.",
      "Delete a source bucket whenever moving its last key. Read any key from the first or last real bucket for the extrema."
    ],
    invariants: [
      "Real buckets are nonempty and strictly increasing by count.",
      "Every stored key appears in exactly one bucket and keyToBucket points to that bucket.",
      "Adjacent counts needed by an update are either already the neighboring bucket or can be inserted there without scanning."
    ],
    diagram: {
      caption: "Keys move one hop through an ordered linked list of count buckets.",
      nodes: [
        { id: "head", label: "head sentinel" },
        { id: "one", label: "count 1: {leet,...}" },
        { id: "two", label: "count 2: {hello,...}" },
        { id: "tail", label: "tail sentinel" }
      ],
      edges: [
        { from: "head", to: "one", label: "minimum bucket" },
        { from: "one", to: "two", label: "inc -> / <- dec" },
        { from: "two", to: "tail", label: "maximum bucket" }
      ]
    },
    pseudocode: `inc(key):
  current = key's bucket, or head for a new key
  targetCount = current.count + 1
  use current.next if it has targetCount, else insert target bucket
  move key to target and remove empty current bucket

dec(key):
  current = key's bucket
  if current.count == 1: remove key entirely
  else use/create previous bucket with current.count - 1 and move key
  remove empty current bucket

getMinKey(): any key in head.next, or empty string
getMaxKey(): any key in tail.prev, or empty string`,
    proof: [
      "An update changes a count by one; placing the key in the existing or newly inserted adjacent bucket gives it exactly the new count while preserving list order.",
      "Removing the key from its old set and deleting empty buckets preserves the one-key-one-nonempty-bucket invariants.",
      "Because bucket counts are increasing, the first real bucket contains precisely the minimum-count keys and the last contains precisely the maximum-count keys."
    ],
    complexity: [
      { operation: "inc / dec", time: "O(1) average", reason: "A hash lookup, a constant number of linked-list edits, and hash-set updates are used." },
      { operation: "getMinKey / getMaxKey", time: "O(1) average", reason: "The extreme bucket and one of its hash-set keys are accessed directly." },
      { operation: "Storage", time: "O(K)", reason: "Each of K keys is stored once, and there can be no more buckets than keys." }
    ],
    python: `class Bucket:
    def __init__(self, count: int = 0):
        self.count = count
        self.keys = set()
        self.prev = None
        self.next = None


class AllOne:
    def __init__(self):
        self.head = Bucket()
        self.tail = Bucket()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.where = {}

    def _insert_after(self, node: Bucket, count: int) -> Bucket:
        created = Bucket(count)
        created.prev = node
        created.next = node.next
        node.next.prev = created
        node.next = created
        return created

    def _remove_if_empty(self, node: Bucket) -> None:
        if node is self.head or node is self.tail or node.keys:
            return
        node.prev.next = node.next
        node.next.prev = node.prev

    def inc(self, key: str) -> None:
        current = self.where.get(key, self.head)
        target_count = current.count + 1
        if current.next is self.tail or current.next.count != target_count:
            target = self._insert_after(current, target_count)
        else:
            target = current.next

        target.keys.add(key)
        self.where[key] = target
        if current is not self.head:
            current.keys.remove(key)
            self._remove_if_empty(current)

    def dec(self, key: str) -> None:
        current = self.where[key]
        if current.count == 1:
            del self.where[key]
        else:
            target_count = current.count - 1
            if current.prev is self.head or current.prev.count != target_count:
                target = self._insert_after(current.prev, target_count)
            else:
                target = current.prev
            target.keys.add(key)
            self.where[key] = target

        current.keys.remove(key)
        self._remove_if_empty(current)

    def getMaxKey(self) -> str:
        if self.tail.prev is self.head:
            return ''
        return next(iter(self.tail.prev.keys))

    def getMinKey(self) -> str:
        if self.head.next is self.tail:
            return ''
        return next(iter(self.head.next.keys))`,
    cpp: `#include <iterator>
#include <list>
#include <string>
#include <unordered_map>
#include <unordered_set>
using namespace std;

class AllOne {
    struct Bucket {
        int count;
        unordered_set<string> keys;
    };

    list<Bucket> buckets;
    unordered_map<string, list<Bucket>::iterator> where;

public:
    AllOne() = default;

    void inc(string key) {
        auto found = where.find(key);
        if (found == where.end()) {
            if (buckets.empty() || buckets.front().count != 1) {
                buckets.push_front({1, {}});
            }
            buckets.front().keys.insert(key);
            where[key] = buckets.begin();
            return;
        }

        auto current = found->second;
        auto nextBucket = next(current);
        if (nextBucket == buckets.end() ||
            nextBucket->count != current->count + 1) {
            nextBucket = buckets.insert(nextBucket, {current->count + 1, {}});
        }
        nextBucket->keys.insert(key);
        where[key] = nextBucket;
        current->keys.erase(key);
        if (current->keys.empty()) buckets.erase(current);
    }

    void dec(string key) {
        auto current = where[key];
        if (current->count == 1) {
            where.erase(key);
        } else {
            list<Bucket>::iterator previousBucket;
            if (current == buckets.begin() ||
                prev(current)->count != current->count - 1) {
                previousBucket = buckets.insert(current,
                    {current->count - 1, {}});
            } else {
                previousBucket = prev(current);
            }
            previousBucket->keys.insert(key);
            where[key] = previousBucket;
        }

        current->keys.erase(key);
        if (current->keys.empty()) buckets.erase(current);
    }

    string getMaxKey() {
        if (buckets.empty()) return "";
        return *buckets.back().keys.begin();
    }

    string getMinKey() {
        if (buckets.empty()) return "";
        return *buckets.front().keys.begin();
    }
};`
  }
};
