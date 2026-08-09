export default {
  "146": {
    inputModel: "The constructor receives a positive capacity. Every later command is either get(key), which reads and refreshes a key, or put(key, value), which inserts or replaces a key and may trigger one eviction.",
    outputModel: "get returns the stored value or -1. Construction and put return no value; their observable effect is the cache contents and recency order.",
    example: {
      input: `["LRUCache", "put", "put", "get", "put", "put", "get", "get"]\n[[3], [7, 70], [8, 80], [7], [9, 90], [10, 100], [8], [9]]`,
      output: `[null, null, null, 70, null, null, -1, 90]`,
      trace: [
        { call: "put(7, 70), put(8, 80)", state: "LRU [7, 8] MRU", result: "Both entries fit" },
        { call: "get(7)", state: "Key 7 moves to the recent end: [8, 7]", result: "70" },
        { call: "put(9, 90)", state: "Capacity is reached with order [8, 7, 9]", result: "No eviction" },
        { call: "put(10, 100)", state: "Key 8 is removed; order becomes [7, 9, 10]", result: "Evicts key 8" },
        { call: "get(8), get(9)", state: "8 is absent; then 9 moves to MRU: [7, 10, 9]", result: "-1, then 90" }
      ]
    },
    intuition: "Two independent questions must be answered quickly: where is a key, and which key is oldest? A hash table answers the first. A doubly linked list answers the second and can move a known node without scanning. Dummy endpoints turn insertion, removal, and eviction into the same pointer operations even at the boundaries.",
    approach: [
      "Store every live key in a map whose value is its linked-list node.",
      "Keep nodes between head and tail sentinels, ordered from least recent near head to most recent near tail.",
      "On a successful get or an update, detach the node and append it before tail.",
      "On a new put, append a node and, if capacity is exceeded, remove head.next from both structures."
    ],
    invariants: [
      "A live key appears exactly once in the map and exactly once in the recency list.",
      "Reading the list from head to tail always goes from least to most recently used.",
      "The number of mapped keys never exceeds capacity after a public operation finishes."
    ],
    diagram: {
      caption: "The map jumps to nodes; the list alone owns recency order.",
      nodes: [
        { id: "map", label: "key -> node map" },
        { id: "head", label: "HEAD sentinel" },
        { id: "lru", label: "least recent node" },
        { id: "mru", label: "most recent node" },
        { id: "tail", label: "TAIL sentinel" }
      ],
      edges: [
        { from: "map", to: "lru", label: "O(1) lookup" },
        { from: "map", to: "mru", label: "O(1) lookup" },
        { from: "head", to: "lru", label: "next" },
        { from: "lru", to: "mru", label: "recency" },
        { from: "mru", to: "tail", label: "next" }
      ]
    },
    pseudocode: String.raw`GET(key):
  if key is absent: return -1
  node = index[key]
  detach node; append node before tail
  return node.value

PUT(key, value):
  if key exists:
    replace its value; move its node before tail; return
  create and append a node; add it to index
  if size exceeds capacity:
    victim = head.next
    detach victim; erase victim.key from index`,
    proof: [
      "A hit moves exactly the accessed node to the MRU end while preserving the relative order of every other node, so the list remains the true recency order.",
      "When insertion overflows capacity, head.next is the first real node and therefore the least recently used key; removing it performs exactly the required eviction.",
      "Every list mutation is mirrored in the map, so subsequent key lookup and eviction cannot observe stale nodes."
    ],
    complexity: [
      { operation: "get", time: "O(1) average", reason: "One hash lookup and a constant number of pointer changes." },
      { operation: "put", time: "O(1) average", reason: "Lookup, insertion, refresh, and optional eviction are all constant-size operations." },
      { operation: "space", time: "O(capacity)", reason: "At most one map entry and one node are stored per live key." }
    ],
    python: String.raw`class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.nodes = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev

    def _append_recent(self, node: Node) -> None:
        previous = self.tail.prev
        previous.next = node
        node.prev = previous
        node.next = self.tail
        self.tail.prev = node

    def _refresh(self, node: Node) -> None:
        self._remove(node)
        self._append_recent(node)

    def get(self, key: int) -> int:
        if key not in self.nodes:
            return -1
        node = self.nodes[key]
        self._refresh(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.nodes:
            node = self.nodes[key]
            node.value = value
            self._refresh(node)
            return

        node = Node(key, value)
        self.nodes[key] = node
        self._append_recent(node)

        if len(self.nodes) > self.capacity:
            victim = self.head.next
            self._remove(victim)
            del self.nodes[victim.key]`,
    cpp: String.raw`#include <iterator>
#include <list>
#include <unordered_map>
#include <utility>
using namespace std;

class LRUCache {
    int capacity;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int, int>>::iterator> where;

    void refresh(list<pair<int, int>>::iterator it) {
        order.splice(order.end(), order, it);
    }

public:
    LRUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto found = where.find(key);
        if (found == where.end()) return -1;
        refresh(found->second);
        return found->second->second;
    }

    void put(int key, int value) {
        auto found = where.find(key);
        if (found != where.end()) {
            found->second->second = value;
            refresh(found->second);
            return;
        }

        order.push_back({key, value});
        where[key] = prev(order.end());

        if (static_cast<int>(where.size()) > capacity) {
            int victim = order.front().first;
            order.pop_front();
            where.erase(victim);
        }
    }
};`
  },

  "460": {
    inputModel: "The cache receives a capacity followed by get and put calls. Every successful access raises that key's frequency; eviction first minimizes frequency and then chooses the least recent key within that frequency.",
    outputModel: "get returns a value or -1. put returns nothing but can update frequency, insert a key, or evict one key according to the two-level ordering rule.",
    example: {
      input: `["LFUCache", "put", "put", "put", "get", "get", "put", "get", "get"]\n[[3], [4, 40], [5, 50], [6, 60], [4], [5], [7, 70], [6], [7]]`,
      output: `[null, null, null, null, 40, 50, null, -1, 70]`,
      trace: [
        { call: "put(4, 40), put(5, 50), put(6, 60)", state: "frequency 1 LRU -> MRU: [4, 5, 6]", result: "Cache fills" },
        { call: "get(4)", state: "frequency 1: [5, 6]; frequency 2: [4]", result: "40" },
        { call: "get(5)", state: "frequency 1: [6]; frequency 2: [4, 5]", result: "50" },
        { call: "put(7, 70)", state: "Key 6 is the only frequency-1 key; 7 replaces it", result: "Evicts key 6" },
        { call: "get(6), get(7)", state: "6 is absent; 7 is promoted to frequency 2", result: "-1, then 70" }
      ]
    },
    intuition: "LFU is not one ordering: it is frequency first and recency second. Group keys by frequency, then maintain an LRU order inside every group. A key map locates entries, while minFrequency names the only group from which eviction is legal. Moving a key touches only its old and next frequency buckets.",
    approach: [
      "Map each key to its value and current frequency.",
      "For every frequency, maintain an insertion-ordered set or linked list from least to most recent.",
      "Promote a touched key from bucket f to bucket f + 1, repairing minFrequency if the old minimum bucket becomes empty.",
      "When full, evict the oldest key from minFrequency; every newly inserted key starts at frequency 1."
    ],
    invariants: [
      "Each live key belongs to exactly one frequency bucket matching its recorded frequency.",
      "Within a bucket, order is least recent to most recent among keys with that frequency.",
      "minFrequency is the smallest frequency of any live key whenever the cache is nonempty."
    ],
    diagram: {
      caption: "The eviction coordinate is the oldest node in the minimum-frequency bucket.",
      nodes: [
        { id: "keys", label: "key -> value, frequency" },
        { id: "min", label: "minFrequency" },
        { id: "f1", label: "frequency 1: LRU ... MRU" },
        { id: "f2", label: "frequency 2: LRU ... MRU" },
        { id: "f3", label: "frequency 3: LRU ... MRU" }
      ],
      edges: [
        { from: "keys", to: "f1", label: "direct membership" },
        { from: "keys", to: "f2", label: "direct membership" },
        { from: "min", to: "f1", label: "eviction bucket" },
        { from: "f1", to: "f2", label: "touch promotes" },
        { from: "f2", to: "f3", label: "touch promotes" }
      ]
    },
    pseudocode: String.raw`TOUCH(key):
  f = frequency[key]
  remove key from bucket[f]
  if f equals minFrequency and bucket[f] is empty:
    minFrequency = f + 1
  frequency[key] = f + 1
  append key as most recent in bucket[f + 1]

GET(key):
  if absent: return -1
  TOUCH(key); return value[key]

PUT(key, value):
  if capacity is zero: return
  if key exists: replace value; TOUCH(key); return
  if full: remove the LRU key from bucket[minFrequency]
  insert key with frequency 1; minFrequency = 1`,
    proof: [
      "Promotion removes a key from its exact old bucket and appends it to the next bucket, so both its count and its recency among equal-count keys are correct.",
      "minFrequency changes only when its final key is promoted, in which case the promoted frequency f + 1 is the new smallest possible live frequency.",
      "At overflow, the oldest key in the minimum bucket has the smallest count and wins the required LRU tie-break, so the selected victim is correct."
    ],
    complexity: [
      { operation: "get", time: "O(1) average", reason: "Hash lookup plus constant-time removal and insertion in ordered buckets." },
      { operation: "put", time: "O(1) average", reason: "Update, promotion, and eviction touch only a constant number of indexed entries." },
      { operation: "space", time: "O(capacity)", reason: "Each key has one value record, one frequency record, and one bucket membership." }
    ],
    python: String.raw`from collections import OrderedDict, defaultdict


class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.min_frequency = 0
        self.values = {}
        self.frequencies = {}
        self.groups = defaultdict(OrderedDict)

    def _touch(self, key: int) -> None:
        frequency = self.frequencies[key]
        del self.groups[frequency][key]

        if frequency == self.min_frequency and not self.groups[frequency]:
            self.min_frequency += 1

        self.frequencies[key] = frequency + 1
        self.groups[frequency + 1][key] = None

    def get(self, key: int) -> int:
        if key not in self.values:
            return -1
        self._touch(key)
        return self.values[key]

    def put(self, key: int, value: int) -> None:
        if self.capacity == 0:
            return

        if key in self.values:
            self.values[key] = value
            self._touch(key)
            return

        if len(self.values) == self.capacity:
            victim, _ = self.groups[self.min_frequency].popitem(last=False)
            del self.values[victim]
            del self.frequencies[victim]

        self.values[key] = value
        self.frequencies[key] = 1
        self.groups[1][key] = None
        self.min_frequency = 1`,
    cpp: String.raw`#include <iterator>
#include <list>
#include <unordered_map>
#include <utility>
using namespace std;

class LFUCache {
    int capacity;
    int minFrequency = 0;
    unordered_map<int, pair<int, int>> data;
    unordered_map<int, list<int>> groups;
    unordered_map<int, list<int>::iterator> position;

    void touch(int key) {
        int frequency = data[key].second;
        groups[frequency].erase(position[key]);

        if (frequency == minFrequency && groups[frequency].empty()) {
            ++minFrequency;
        }

        ++data[key].second;
        groups[frequency + 1].push_back(key);
        position[key] = prev(groups[frequency + 1].end());
    }

public:
    LFUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        if (!data.count(key)) return -1;
        int value = data[key].first;
        touch(key);
        return value;
    }

    void put(int key, int value) {
        if (capacity == 0) return;

        if (data.count(key)) {
            data[key].first = value;
            touch(key);
            return;
        }

        if (static_cast<int>(data.size()) == capacity) {
            int victim = groups[minFrequency].front();
            groups[minFrequency].pop_front();
            data.erase(victim);
            position.erase(victim);
        }

        data[key] = {value, 1};
        groups[1].push_back(key);
        position[key] = prev(groups[1].end());
        minFrequency = 1;
    }
};`
  },

  "588": {
    inputModel: "Commands use absolute slash-separated paths. A path may identify the root, a directory, or a file; mkdir can create several missing directories, and file writes append rather than replace.",
    outputModel: "ls returns one file name for a file path or sorted child names for a directory path. readContentFromFile returns accumulated text; mutating commands return nothing.",
    example: {
      input: `["FileSystem", "mkdir", "addContentToFile", "addContentToFile", "mkdir", "ls", "readContentFromFile"]\n[[], ["/projects/atlas"], ["/projects/atlas/readme", "alpha"], ["/projects/atlas/readme", " beta"], ["/projects/demo"], ["/projects"], ["/projects/atlas/readme"]]`,
      output: `[null, null, null, null, null, ["atlas", "demo"], "alpha beta"]`,
      trace: [
        { call: "mkdir('/projects/atlas')", state: "root -> projects -> atlas directory chain exists", result: "Directories created" },
        { call: "addContentToFile('/projects/atlas/readme', 'alpha')", state: "readme is a file containing alpha", result: "File created" },
        { call: "addContentToFile('/projects/atlas/readme', ' beta')", state: "The same node now contains alpha beta", result: "Text appended" },
        { call: "mkdir('/projects/demo'); ls('/projects')", state: "projects has children atlas and demo", result: "['atlas', 'demo']" },
        { call: "readContentFromFile('/projects/atlas/readme')", state: "Traversal ends at the readme file", result: "alpha beta" }
      ]
    },
    intuition: "Paths already describe a rooted hierarchy, so model that hierarchy directly. Every node maps a segment name to a child. The terminal node additionally records whether it is a file and stores its text. One traversal helper makes all four operations agree on how paths are parsed and followed.",
    approach: [
      "Split a path into nonempty components so root is represented by an empty component list.",
      "Walk the components from a permanent root node, optionally creating missing children.",
      "Mark the final node as a file when content is first appended, and keep appending to its content.",
      "For ls, return the terminal file name if it is a file; otherwise return the terminal node's child names in lexical order."
    ],
    invariants: [
      "Following child names from root yields exactly one node for every existing path.",
      "A file node owns content, while a directory node owns the namespace listed by ls.",
      "All public operations use the same component parsing and traversal rules."
    ],
    diagram: {
      caption: "Each path segment selects one child in a trie-like filesystem tree.",
      nodes: [
        { id: "root", label: "/ directory" },
        { id: "projects", label: "projects directory" },
        { id: "atlas", label: "atlas directory" },
        { id: "demo", label: "demo directory" },
        { id: "readme", label: "readme file: alpha beta" }
      ],
      edges: [
        { from: "root", to: "projects", label: "child projects" },
        { from: "projects", to: "atlas", label: "child atlas" },
        { from: "projects", to: "demo", label: "child demo" },
        { from: "atlas", to: "readme", label: "child readme" }
      ]
    },
    pseudocode: String.raw`PARTS(path):
  return all nonempty segments separated by '/'

WALK(path, create):
  node = root
  for segment in PARTS(path):
    if segment absent and create: make child node
    node = node.children[segment]
  return node

LS(path):
  node = WALK(path, false)
  if node is a file: return [last segment]
  return sorted child names

MKDIR(path): WALK(path, true)
ADD(filePath, text): node = WALK(filePath, true); mark file; append text
READ(filePath): return WALK(filePath, false).content`,
    proof: [
      "Inducting over path components, WALK begins at root and follows the uniquely named child for each next component, so it ends at exactly the node named by the path.",
      "mkdir creates every missing component along that walk and therefore establishes the entire requested directory chain without disturbing existing nodes.",
      "ls distinguishes terminal node type: a file has exactly its own name as output, while sorted child keys are exactly a directory's required entries."
    ],
    complexity: [
      { operation: "path traversal", time: "O(p) average", reason: "Each of p path components performs one child-map lookup." },
      { operation: "ls(directory)", time: "O(p + c log c)", reason: "After traversal, c child names are sorted." },
      { operation: "space", time: "O(nodes + content)", reason: "The tree stores one node per created path component plus all appended text." }
    ],
    python: String.raw`from typing import List


class Node:
    def __init__(self):
        self.children = {}
        self.is_file = False
        self.content = ""


class FileSystem:
    def __init__(self):
        self.root = Node()

    def _parts(self, path: str) -> List[str]:
        return [part for part in path.split("/") if part]

    def _walk(self, path: str, create: bool = False) -> Node:
        node = self.root
        for part in self._parts(path):
            if part not in node.children:
                if not create:
                    raise KeyError(path)
                node.children[part] = Node()
            node = node.children[part]
        return node

    def ls(self, path: str) -> List[str]:
        node = self._walk(path)
        if node.is_file:
            return [self._parts(path)[-1]]
        return sorted(node.children)

    def mkdir(self, path: str) -> None:
        self._walk(path, True)

    def addContentToFile(self, filePath: str, content: str) -> None:
        node = self._walk(filePath, True)
        node.is_file = True
        node.content += content

    def readContentFromFile(self, filePath: str) -> str:
        return self._walk(filePath).content`,
    cpp: String.raw`#include <map>
#include <memory>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

class FileSystem {
    struct Node {
        map<string, unique_ptr<Node>> children;
        bool isFile = false;
        string content;
    };

    Node root;

    vector<string> parts(const string& path) {
        vector<string> result;
        string part;
        stringstream stream(path);
        while (getline(stream, part, '/')) {
            if (!part.empty()) result.push_back(part);
        }
        return result;
    }

    Node* walk(const string& path, bool create) {
        Node* node = &root;
        for (const string& part : parts(path)) {
            if (!node->children.count(part)) {
                if (!create) return nullptr;
                node->children[part] = make_unique<Node>();
            }
            node = node->children[part].get();
        }
        return node;
    }

public:
    FileSystem() = default;

    vector<string> ls(string path) {
        vector<string> pathParts = parts(path);
        Node* node = walk(path, false);
        if (node->isFile) return {pathParts.back()};

        vector<string> names;
        for (const auto& entry : node->children) {
            names.push_back(entry.first);
        }
        return names;
    }

    void mkdir(string path) {
        walk(path, true);
    }

    void addContentToFile(string filePath, string content) {
        Node* node = walk(filePath, true);
        node->isFile = true;
        node->content += content;
    }

    string readContentFromFile(string filePath) {
        return walk(filePath, false)->content;
    }
};`
  },

  "604": {
    inputModel: "The constructor receives run-length text made of a character followed by a positive, possibly multi-digit count. Calls then ask whether output remains or request the next logical character.",
    outputModel: "hasNext returns a boolean. next returns the next decoded character and consumes one occurrence; after exhaustion it returns a single space character.",
    example: {
      input: `["StringIterator", "hasNext", "next", "next", "next", "next", "hasNext", "next", "next", "next", "hasNext"]\n[["a3B2z4"], [], [], [], [], [], [], [], [], [], []]`,
      output: `[null, true, "a", "a", "a", "B", true, "B", "z", "z", true]`,
      trace: [
        { call: "hasNext()", state: "The cursor is before run a3", result: "true" },
        { call: "next(), next(), next()", state: "Run a3 is parsed and fully consumed", result: "a, a, a" },
        { call: "next()", state: "Run B2 is parsed with one B remaining", result: "B" },
        { call: "hasNext(); next()", state: "The active run supplies its final B", result: "true, then B" },
        { call: "next(), next(), hasNext()", state: "Run z4 still has two outputs after returning two z characters", result: "z, z, then true" }
      ]
    },
    intuition: "Expanding a run with a huge count wastes memory. The iterator only needs the original string, a cursor into unparsed input, the active character, and that run's remaining count. Parse a new run only when the active one reaches zero; repeated next calls inside a run then cost constant time.",
    approach: [
      "Keep cursor at the first unparsed character and remaining at the number of active outputs left.",
      "When next sees remaining equal to zero, read one character and then fold every following digit into a multi-digit count.",
      "Consume one occurrence by decrementing remaining and returning the active character.",
      "hasNext is true when either the active run remains or unparsed encoded text remains."
    ],
    invariants: [
      "All encoded text before cursor has been parsed, and only remaining occurrences of active may still be unreturned from that prefix.",
      "remaining is never negative and is zero exactly when no active run is pending.",
      "No decoded character is materialized before its next call."
    ],
    diagram: {
      caption: "The cursor crosses an encoded run once while remaining serves repeated next calls.",
      nodes: [
        { id: "encoded", label: "a3 B2 z4" },
        { id: "cursor", label: "cursor at next run" },
        { id: "active", label: "active = B" },
        { id: "remaining", label: "remaining = 1" },
        { id: "next", label: "next output" }
      ],
      edges: [
        { from: "cursor", to: "encoded", label: "parse on demand" },
        { from: "encoded", to: "active", label: "character" },
        { from: "encoded", to: "remaining", label: "digit sequence" },
        { from: "active", to: "next", label: "return" },
        { from: "remaining", to: "next", label: "consume one" }
      ]
    },
    pseudocode: String.raw`HAS_NEXT():
  return remaining > 0 or cursor < encoded.length

NEXT():
  if not HAS_NEXT(): return space
  if remaining == 0:
    active = encoded[cursor]; cursor += 1
    remaining = 0
    while cursor points to a digit:
      remaining = remaining * 10 + digit value
      cursor += 1
  remaining -= 1
  return active`,
    proof: [
      "When a run is loaded, parsing all consecutive digits obtains exactly its declared count, and each later next decrements that count once while returning the declared character.",
      "A new run is not parsed until remaining reaches zero, so output order follows encoded run order and no occurrence is skipped or duplicated.",
      "hasNext checks both possible sources of output—an active run or an unparsed run—so it is false exactly at logical exhaustion."
    ],
    complexity: [
      { operation: "next", time: "O(1) amortized", reason: "Each encoded character and digit is parsed once; calls inside a run do constant work." },
      { operation: "hasNext", time: "O(1)", reason: "It checks two scalar state values." },
      { operation: "extra space", time: "O(1)", reason: "The solution stores only the encoded input and four cursor-state scalars." }
    ],
    python: String.raw`class StringIterator:
    def __init__(self, compressedString: str):
        self.encoded = compressedString
        self.cursor = 0
        self.active = " "
        self.remaining = 0

    def next(self) -> str:
        if not self.hasNext():
            return " "

        if self.remaining == 0:
            self.active = self.encoded[self.cursor]
            self.cursor += 1

            while self.cursor < len(self.encoded) and self.encoded[self.cursor].isdigit():
                self.remaining = self.remaining * 10 + int(self.encoded[self.cursor])
                self.cursor += 1

        self.remaining -= 1
        return self.active

    def hasNext(self) -> bool:
        return self.remaining > 0 or self.cursor < len(self.encoded)`,
    cpp: String.raw`#include <cctype>
#include <string>
#include <utility>
using namespace std;

class StringIterator {
    string encoded;
    int cursor = 0;
    char active = ' ';
    long long remaining = 0;

public:
    StringIterator(string compressedString) : encoded(move(compressedString)) {}

    char next() {
        if (!hasNext()) return ' ';

        if (remaining == 0) {
            active = encoded[cursor++];
            while (cursor < static_cast<int>(encoded.size()) &&
                   isdigit(static_cast<unsigned char>(encoded[cursor]))) {
                remaining = remaining * 10 + (encoded[cursor] - '0');
                ++cursor;
            }
        }

        --remaining;
        return active;
    }

    bool hasNext() {
        return remaining > 0 || cursor < static_cast<int>(encoded.size());
    }
};`
  },

  "1756": {
    inputModel: "The queue starts as [1, 2, ..., n]. Each fetch(k) uses a 1-based rank, removes that current k-th value, appends it to the most-recent end, and returns it.",
    outputModel: "Every fetch returns the selected value. The queue's order changes after each call even though its length remains n.",
    example: {
      input: `["MRUQueue", "fetch", "fetch", "fetch", "fetch"]\n[[7], [1], [4], [6], [3]]`,
      output: `[null, 1, 5, 1, 4]`,
      trace: [
        { call: "fetch(1)", state: "[2, 3, 4, 5, 6, 7, 1]", result: "1" },
        { call: "fetch(4)", state: "[2, 3, 4, 6, 7, 1, 5]", result: "5" },
        { call: "fetch(6)", state: "[2, 3, 4, 6, 7, 5, 1]", result: "1" },
        { call: "fetch(3)", state: "[2, 3, 6, 7, 5, 1, 4]", result: "4" }
      ]
    },
    intuition: "Array deletion shifts a suffix, so represent logical order as occupied positions on a longer timeline. Initial values occupy positions 1 through n. A Fenwick tree stores 1 for an occupied position and 0 for a removed one, allowing selection of the k-th live position. Moving a value to MRU clears its old position and writes it at the next unused position.",
    approach: [
      "Assign each initial value a physical position and mark every position live in a Fenwick tree.",
      "Find the physical position of the k-th live item with Fenwick prefix-count binary lifting.",
      "Set that position's live count to zero, then place the same value at the next unused position with live count one.",
      "Return the moved value; increasing physical positions exactly encode increasing recency."
    ],
    invariants: [
      "Exactly n physical positions have Fenwick weight one, and their increasing position order equals current queue order.",
      "Every value appears at exactly one live position.",
      "The next append position is larger than every position used by a live item."
    ],
    diagram: {
      caption: "Sparse physical slots avoid shifting while Fenwick prefix counts recover logical rank.",
      nodes: [
        { id: "rank", label: "logical rank k" },
        { id: "bit", label: "Fenwick live counts" },
        { id: "old", label: "selected physical slot" },
        { id: "value", label: "selected value" },
        { id: "new", label: "new rightmost slot" }
      ],
      edges: [
        { from: "rank", to: "bit", label: "k-th live query" },
        { from: "bit", to: "old", label: "locate" },
        { from: "old", to: "value", label: "read" },
        { from: "value", to: "new", label: "append" },
        { from: "old", to: "bit", label: "-1 old, +1 new" }
      ]
    },
    pseudocode: String.raw`CONSTRUCTOR(n):
  positions 1..n store values 1..n
  add 1 at each position in Fenwick tree
  nextPosition = n

FETCH(k):
  oldPosition = Fenwick.findByOrder(k)
  value = values[oldPosition]
  Fenwick.add(oldPosition, -1)
  nextPosition += 1
  values[nextPosition] = value
  Fenwick.add(nextPosition, +1)
  return value`,
    proof: [
      "Fenwick prefix sums count live slots, so the smallest physical position with prefix count at least k is precisely the k-th queue item.",
      "Clearing the selected slot removes exactly that item; inserting it beyond every prior slot makes it last while preserving the relative order of all other live slots.",
      "The update replaces one live weight with another, so the queue continues to contain exactly n items and every later rank query remains valid."
    ],
    complexity: [
      { operation: "fetch", time: "O(log(n + q))", reason: "One order-statistic Fenwick search and two point updates are logarithmic after q calls." },
      { operation: "construction", time: "O(n log(n + q))", reason: "The implementation marks the n initial positions with Fenwick updates." },
      { operation: "space", time: "O(n + q)", reason: "Each fetch consumes one new physical position; the problem permits at most 2000 fetch calls." }
    ],
    python: String.raw`class MRUQueue:
    def __init__(self, n: int):
        self.limit = n + 2005
        self.bit = [0] * (self.limit + 1)
        self.values = [0] * (self.limit + 1)
        self.next_position = n

        for position in range(1, n + 1):
            self.values[position] = position
            self._add(position, 1)

    def _add(self, index: int, delta: int) -> None:
        while index <= self.limit:
            self.bit[index] += delta
            index += index & -index

    def _find_by_order(self, order: int) -> int:
        index = 0
        step = 1 << (self.limit.bit_length() - 1)

        while step:
            candidate = index + step
            if candidate <= self.limit and self.bit[candidate] < order:
                index = candidate
                order -= self.bit[candidate]
            step >>= 1

        return index + 1

    def fetch(self, k: int) -> int:
        old_position = self._find_by_order(k)
        value = self.values[old_position]
        self._add(old_position, -1)

        self.next_position += 1
        self.values[self.next_position] = value
        self._add(self.next_position, 1)
        return value`,
    cpp: String.raw`#include <vector>
using namespace std;

class MRUQueue {
    int limit;
    int nextPosition;
    vector<int> bit;
    vector<int> values;

    void add(int index, int delta) {
        while (index <= limit) {
            bit[index] += delta;
            index += index & -index;
        }
    }

    int findByOrder(int order) {
        int index = 0;
        int step = 1;
        while ((step << 1) <= limit) step <<= 1;

        while (step > 0) {
            int candidate = index + step;
            if (candidate <= limit && bit[candidate] < order) {
                index = candidate;
                order -= bit[candidate];
            }
            step >>= 1;
        }
        return index + 1;
    }

public:
    MRUQueue(int n)
        : limit(n + 2005), nextPosition(n), bit(limit + 1), values(limit + 1) {
        for (int position = 1; position <= n; ++position) {
            values[position] = position;
            add(position, 1);
        }
    }

    int fetch(int k) {
        int oldPosition = findByOrder(k);
        int value = values[oldPosition];
        add(oldPosition, -1);

        ++nextPosition;
        values[nextPosition] = value;
        add(nextPosition, 1);
        return value;
    }
};`
  },

  "346": {
    inputModel: "The constructor fixes a window size. Each next(value) appends one stream value, keeps only the newest size values, and asks for the average of the values currently retained.",
    outputModel: "Every next call returns a floating-point average. Before the window fills, the denominator is the number of values seen; afterward it is the fixed window size.",
    example: {
      input: `["MovingAverage", "next", "next", "next", "next", "next"]\n[[4], [6], [-2], [10], [4], [8]]`,
      output: `[null, 6.0, 2.0, 4.66667, 4.5, 5.0]`,
      trace: [
        { call: "next(6)", state: "window = [6], sum = 6", result: "6 / 1 = 6.0" },
        { call: "next(-2)", state: "window = [6, -2], sum = 4", result: "4 / 2 = 2.0" },
        { call: "next(10)", state: "window = [6, -2, 10], sum = 14", result: "14 / 3" },
        { call: "next(4)", state: "window = [6, -2, 10, 4], sum = 18", result: "18 / 4 = 4.5" },
        { call: "next(8)", state: "Evict 6; window = [-2, 10, 4, 8], sum = 20", result: "20 / 4 = 5.0" }
      ]
    },
    intuition: "Recomputing a sum scans the whole window even though consecutive windows differ by at most two values. Keep the live values in FIFO order and carry their sum forward. A new value is added once; when the queue grows too large, its oldest value is subtracted once.",
    approach: [
      "Store live window values in a queue and maintain their running sum.",
      "Append the new value and add it to the sum.",
      "If the queue exceeds the configured size, pop its front value and subtract it.",
      "Divide the maintained sum by the current queue length."
    ],
    invariants: [
      "The queue contains exactly the newest min(values seen, window size) values in arrival order.",
      "The running sum equals the sum of every value currently in the queue."
    ],
    diagram: {
      caption: "One value enters at the right, one expired value may leave at the left, and the sum follows both changes.",
      nodes: [
        { id: "new", label: "new value 8" },
        { id: "queue", label: "queue [6, -2, 10, 4]" },
        { id: "old", label: "expired value 6" },
        { id: "sum", label: "sum 18 -> 20" },
        { id: "avg", label: "average 20 / 4" }
      ],
      edges: [
        { from: "new", to: "queue", label: "append" },
        { from: "queue", to: "old", label: "pop if oversized" },
        { from: "new", to: "sum", label: "+8" },
        { from: "old", to: "sum", label: "-6" },
        { from: "sum", to: "avg", label: "divide by queue size" }
      ]
    },
    pseudocode: String.raw`NEXT(value):
  enqueue value
  sum += value
  if queue.length > windowSize:
    expired = dequeue front
    sum -= expired
  return sum / queue.length`,
    proof: [
      "After appending, the queue contains the previous live suffix plus the newest value; removing the front only when oversized leaves exactly the required newest window.",
      "The sum adds every entering value and subtracts exactly the value that leaves, so it remains equal to the queue's contents and the returned quotient is the required average."
    ],
    complexity: [
      { operation: "next", time: "O(1)", reason: "It performs one append, at most one pop, and scalar arithmetic." },
      { operation: "space", time: "O(window size)", reason: "Only values in the current window are retained." }
    ],
    python: String.raw`from collections import deque


class MovingAverage:
    def __init__(self, size: int):
        self.size = size
        self.window = deque()
        self.total = 0

    def next(self, val: int) -> float:
        self.window.append(val)
        self.total += val

        if len(self.window) > self.size:
            self.total -= self.window.popleft()

        return self.total / len(self.window)`,
    cpp: String.raw`#include <deque>
using namespace std;

class MovingAverage {
    int size;
    long long total = 0;
    deque<int> window;

public:
    MovingAverage(int size) : size(size) {}

    double next(int val) {
        window.push_back(val);
        total += val;

        if (static_cast<int>(window.size()) > size) {
            total -= window.front();
            window.pop_front();
        }

        return static_cast<double>(total) / window.size();
    }
};`
  },

  "359": {
    inputModel: "Calls arrive in nondecreasing timestamp order and contain a message string. A message may print only when it was not printed during the preceding 10-second cooldown.",
    outputModel: "shouldPrintMessage returns true when this call is allowed and records the print time; it returns false otherwise and must not extend the cooldown.",
    example: {
      input: `["Logger", "shouldPrintMessage", "shouldPrintMessage", "shouldPrintMessage", "shouldPrintMessage", "shouldPrintMessage", "shouldPrintMessage"]\n[[], [5, "sync"], [7, "sync"], [8, "cache"], [15, "sync"], [17, "cache"], [18, "cache"]]`,
      output: `[null, true, false, true, true, false, true]`,
      trace: [
        { call: "shouldPrintMessage(5, 'sync')", state: "sync next allowed at 15", result: "true" },
        { call: "shouldPrintMessage(7, 'sync')", state: "7 is earlier than sync's boundary 15", result: "false" },
        { call: "shouldPrintMessage(8, 'cache')", state: "cache next allowed at 18; sync is independent", result: "true" },
        { call: "shouldPrintMessage(15, 'sync')", state: "sync reaches its boundary and moves it to 25", result: "true" },
        { call: "shouldPrintMessage(17, 'cache'); then (18, 'cache')", state: "17 is rejected without mutation; 18 reaches the old boundary", result: "false, then true" }
      ]
    },
    intuition: "Different messages have independent cooldown clocks. For each string, store the earliest timestamp at which it may print again. A call is accepted exactly when no clock exists or the current timestamp reaches that boundary. Rejected calls do not mutate the clock because only actual prints count.",
    approach: [
      "Use a hash map from message to its next allowed timestamp.",
      "If timestamp is smaller than the stored boundary, reject immediately.",
      "Otherwise record timestamp + 10 as the new boundary and accept.",
      "Do not update state on rejection."
    ],
    invariants: [
      "For every mapped message, the stored value is exactly ten seconds after its most recent accepted print.",
      "A rejected call leaves all message boundaries unchanged."
    ],
    diagram: {
      caption: "Each message owns an independent time gate.",
      nodes: [
        { id: "call", label: "(timestamp, message)" },
        { id: "map", label: "message -> next allowed" },
        { id: "compare", label: "timestamp >= boundary?" },
        { id: "allow", label: "true; write t + 10" },
        { id: "deny", label: "false; no write" }
      ],
      edges: [
        { from: "call", to: "map", label: "look up message" },
        { from: "map", to: "compare", label: "boundary" },
        { from: "call", to: "compare", label: "timestamp" },
        { from: "compare", to: "allow", label: "yes" },
        { from: "compare", to: "deny", label: "no" }
      ]
    },
    pseudocode: String.raw`SHOULD_PRINT(timestamp, message):
  allowedAt = nextAllowed.get(message, negative infinity)
  if timestamp < allowedAt:
    return false
  nextAllowed[message] = timestamp + 10
  return true`,
    proof: [
      "The map boundary equals the latest successful print time plus ten, so timestamp reaching that boundary is equivalent to the cooldown having elapsed.",
      "Accepted calls move the boundary to the only correct next value, while rejected calls leave the latest successful print unchanged; therefore every returned decision follows the rule."
    ],
    complexity: [
      { operation: "shouldPrintMessage", time: "O(1) average", reason: "One hash lookup and at most one hash assignment." },
      { operation: "space", time: "O(m)", reason: "One timestamp is stored per distinct message encountered." }
    ],
    python: String.raw`class Logger:
    def __init__(self):
        self.next_allowed = {}

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        if timestamp < self.next_allowed.get(message, 0):
            return False

        self.next_allowed[message] = timestamp + 10
        return True`,
    cpp: String.raw`#include <string>
#include <unordered_map>
using namespace std;

class Logger {
    unordered_map<string, int> nextAllowed;

public:
    Logger() = default;

    bool shouldPrintMessage(int timestamp, string message) {
        auto found = nextAllowed.find(message);
        if (found != nextAllowed.end() && timestamp < found->second) {
            return false;
        }

        nextAllowed[message] = timestamp + 10;
        return true;
    }
};`
  },

  "362": {
    inputModel: "hit(timestamp) records one hit, and getHits(timestamp) asks how many hits occurred in the trailing five minutes. Calls use chronological timestamps, and several hits may share one second.",
    outputModel: "hit returns nothing. getHits returns the number of hits with timestamps strictly greater than timestamp - 300 and at most timestamp.",
    example: {
      input: `["HitCounter", "hit", "hit", "hit", "getHits", "hit", "getHits", "getHits", "hit", "getHits"]\n[[], [10], [10], [20], [100], [309], [309], [310], [310], [610]]`,
      output: `[null, null, null, null, 3, null, 4, 2, null, 0]`,
      trace: [
        { call: "hit(10), hit(10), hit(20)", state: "buckets = [(10,2), (20,1)], total = 3", result: "Three hits recorded" },
        { call: "getHits(100)", state: "Cutoff is -200; no bucket expires", result: "3" },
        { call: "hit(309); getHits(309)", state: "Timestamp 10 remains because 10 > 9; total = 4", result: "4" },
        { call: "getHits(310)", state: "Expire bucket (10,2) because 10 <= 10", result: "2" },
        { call: "hit(310); getHits(610)", state: "At 610, timestamps 20, 309, and 310 are all at or before cutoff 310", result: "0" }
      ]
    },
    intuition: "Chronological calls mean expired hits always form a prefix. Keep timestamp buckets in a queue, combining all hits from the same second, plus a running total. Cleanup repeatedly removes front buckets outside the open lower boundary of the 300-second window.",
    approach: [
      "Store queue entries as timestamp and count so heavy traffic in one second uses one bucket.",
      "Before recording or answering, remove front buckets whose timestamp is at most current timestamp minus 300 and subtract their counts.",
      "On hit, increment the last bucket when its timestamp matches; otherwise append a new bucket.",
      "Return the maintained total for getHits."
    ],
    invariants: [
      "After cleanup at time t, every queue timestamp lies in the valid interval (t - 300, t].",
      "The running total equals the sum of all bucket counts in the queue.",
      "Queue timestamps are increasing and each timestamp appears in at most one bucket."
    ],
    diagram: {
      caption: "Chronological order turns expiration into repeated front removal.",
      nodes: [
        { id: "time", label: "query time t" },
        { id: "cutoff", label: "expire <= t - 300" },
        { id: "front", label: "oldest timestamp bucket" },
        { id: "queue", label: "live timestamp buckets" },
        { id: "total", label: "live hit total" }
      ],
      edges: [
        { from: "time", to: "cutoff", label: "subtract 300" },
        { from: "cutoff", to: "front", label: "test" },
        { from: "front", to: "queue", label: "pop if expired" },
        { from: "front", to: "total", label: "subtract count" },
        { from: "queue", to: "total", label: "sum represented" }
      ]
    },
    pseudocode: String.raw`EXPIRE(timestamp):
  while queue is not empty and queue.front.time <= timestamp - 300:
    total -= queue.front.count
    pop front

HIT(timestamp):
  EXPIRE(timestamp)
  if back bucket has timestamp: increment its count
  else append (timestamp, 1)
  total += 1

GET_HITS(timestamp):
  EXPIRE(timestamp)
  return total`,
    proof: [
      "Because calls are chronological, all expired timestamps precede every valid timestamp, so removing the queue prefix with time at most t - 300 removes exactly the invalid hits.",
      "Each hit increments one bucket and total once, and expiration subtracts that bucket's full count once, so total always counts exactly the live hits.",
      "Coalescing equal timestamps changes only representation, not how many hits their bucket contributes."
    ],
    complexity: [
      { operation: "hit", time: "O(1) amortized", reason: "It appends or increments once; each expired bucket can be removed only once." },
      { operation: "getHits", time: "O(1) amortized", reason: "Cleanup work is charged to buckets permanently removed, then total is returned directly." },
      { operation: "space", time: "O(s)", reason: "At most one bucket is stored per distinct live second, so s is at most 300." }
    ],
    python: String.raw`from collections import deque


class HitCounter:
    def __init__(self):
        self.hits = deque()
        self.total = 0

    def _expire(self, timestamp: int) -> None:
        cutoff = timestamp - 300
        while self.hits and self.hits[0][0] <= cutoff:
            _, count = self.hits.popleft()
            self.total -= count

    def hit(self, timestamp: int) -> None:
        self._expire(timestamp)
        if self.hits and self.hits[-1][0] == timestamp:
            self.hits[-1][1] += 1
        else:
            self.hits.append([timestamp, 1])
        self.total += 1

    def getHits(self, timestamp: int) -> int:
        self._expire(timestamp)
        return self.total`,
    cpp: String.raw`#include <deque>
#include <utility>
using namespace std;

class HitCounter {
    deque<pair<int, int>> hits;
    int total = 0;

    void expire(int timestamp) {
        int cutoff = timestamp - 300;
        while (!hits.empty() && hits.front().first <= cutoff) {
            total -= hits.front().second;
            hits.pop_front();
        }
    }

public:
    HitCounter() = default;

    void hit(int timestamp) {
        expire(timestamp);
        if (!hits.empty() && hits.back().first == timestamp) {
            ++hits.back().second;
        } else {
            hits.push_back({timestamp, 1});
        }
        ++total;
    }

    int getHits(int timestamp) {
        expire(timestamp);
        return total;
    }
};`
  },

  "933": {
    inputModel: "Each ping(t) adds one request at a strictly increasing millisecond timestamp and asks how many requests fall inside the inclusive interval [t - 3000, t].",
    outputModel: "ping returns the number of retained request timestamps after adding t and discarding every timestamp smaller than t - 3000.",
    example: {
      input: `["RecentCounter", "ping", "ping", "ping", "ping", "ping"]\n[[], [50], [2000], [3050], [5001], [5050]]`,
      output: `[null, 1, 2, 3, 2, 3]`,
      trace: [
        { call: "ping(50)", state: "queue = [50], valid interval = [-2950, 50]", result: "1" },
        { call: "ping(2000)", state: "queue = [50, 2000]", result: "2" },
        { call: "ping(3050)", state: "Boundary is 50, so timestamp 50 remains", result: "3" },
        { call: "ping(5001)", state: "Boundary is 2001; remove 50 and 2000, keep [3050, 5001]", result: "2" },
        { call: "ping(5050)", state: "Boundary is 2050; queue becomes [3050, 5001, 5050]", result: "3" }
      ]
    },
    intuition: "Strictly increasing input already sorts the timestamps. After appending t, every expired request is at the queue's front. Pop while the front is below the inclusive lower boundary; the queue length is then the answer.",
    approach: [
      "Append the new timestamp to a FIFO queue.",
      "Compute the inclusive lower boundary t - 3000.",
      "Remove front timestamps strictly smaller than that boundary.",
      "Return the number of timestamps left in the queue."
    ],
    invariants: [
      "The queue is strictly increasing because ping timestamps are strictly increasing.",
      "After cleanup for t, the queue contains exactly the received timestamps in [t - 3000, t]."
    ],
    diagram: {
      caption: "The left boundary advances monotonically, so every request enters and leaves once.",
      nodes: [
        { id: "new", label: "new ping t" },
        { id: "queue", label: "ordered timestamp queue" },
        { id: "boundary", label: "t - 3000" },
        { id: "expired", label: "front < boundary" },
        { id: "answer", label: "queue length" }
      ],
      edges: [
        { from: "new", to: "queue", label: "append" },
        { from: "new", to: "boundary", label: "subtract 3000" },
        { from: "boundary", to: "expired", label: "compare" },
        { from: "queue", to: "expired", label: "front" },
        { from: "queue", to: "answer", label: "after pops" }
      ]
    },
    pseudocode: String.raw`PING(t):
  enqueue t
  boundary = t - 3000
  while queue.front < boundary:
    dequeue front
  return queue.length`,
    proof: [
      "All timestamps after appending t are ordered, so every timestamp below t - 3000 forms one removable prefix.",
      "The loop removes precisely that prefix and keeps the boundary itself, leaving exactly the inclusive target interval; therefore the remaining count is the required answer."
    ],
    complexity: [
      { operation: "ping", time: "O(1) amortized", reason: "Each timestamp is appended once and removed once across the complete call sequence." },
      { operation: "space", time: "O(w)", reason: "Only the w requests in the current 3000-millisecond window are retained." }
    ],
    python: String.raw`from collections import deque


class RecentCounter:
    def __init__(self):
        self.requests = deque()

    def ping(self, t: int) -> int:
        self.requests.append(t)
        boundary = t - 3000

        while self.requests[0] < boundary:
            self.requests.popleft()

        return len(self.requests)`,
    cpp: String.raw`#include <deque>
using namespace std;

class RecentCounter {
    deque<int> requests;

public:
    RecentCounter() = default;

    int ping(int t) {
        requests.push_back(t);
        int boundary = t - 3000;

        while (requests.front() < boundary) {
            requests.pop_front();
        }

        return requests.size();
    }
};`
  },

  "2034": {
    inputModel: "update(timestamp, price) inserts or corrects a record, and timestamps may arrive out of order. Queries ask for the price at the greatest recorded timestamp and the minimum or maximum among all current records.",
    outputModel: "update returns nothing. current returns the corrected price at the latest timestamp; maximum and minimum return extrema after all corrections seen so far.",
    example: {
      input: `["StockPrice", "update", "update", "current", "minimum", "update", "current", "maximum", "update", "maximum", "minimum"]\n[[], [5, 11], [2, 7], [], [], [5, 4], [], [], [9, 13], [], []]`,
      output: `[null, null, null, 11, 7, null, 4, 7, null, 13, 4]`,
      trace: [
        { call: "update(5, 11)", state: "records = {5:11}; latest = 5", result: "Insert first record" },
        { call: "update(2, 7); current()", state: "Timestamp 2 is older, so latest remains 5", result: "11" },
        { call: "minimum()", state: "Current prices are 11 and 7", result: "7" },
        { call: "update(5, 4); current(); maximum()", state: "Latest record is corrected; current prices are 4 and 7", result: "4, then 7" },
        { call: "update(9, 13); maximum(); minimum()", state: "Timestamp 9 becomes latest; prices are 4, 7, and 13", result: "13, then 4" }
      ]
    },
    intuition: "A timestamp-to-price map must be authoritative because corrections replace old values. Track the largest timestamp separately for current(). Extrema need a second index: Python can push every update into min/max heaps and lazily reject entries that disagree with the map, while C++ can erase the old price from a multiset before inserting the correction.",
    approach: [
      "Store the latest accepted price for every timestamp and maintain the greatest timestamp seen.",
      "On update, replace the authoritative map value and add the new price to extrema indexes.",
      "For lazy heaps, discard a heap top while its price no longer matches the authoritative map record at its timestamp.",
      "Return the map value at latest timestamp for current, and the validated top or ordered-set endpoint for extrema."
    ],
    invariants: [
      "The timestamp map contains exactly one current price per recorded timestamp.",
      "latestTimestamp is the maximum key ever inserted into the timestamp map.",
      "An extrema candidate is valid exactly when its stored price equals the authoritative map price for its timestamp."
    ],
    diagram: {
      caption: "The canonical map validates secondary extrema indexes after corrections.",
      nodes: [
        { id: "update", label: "(timestamp, price) update" },
        { id: "map", label: "timestamp -> current price" },
        { id: "latest", label: "greatest timestamp" },
        { id: "min", label: "minimum-price index" },
        { id: "max", label: "maximum-price index" }
      ],
      edges: [
        { from: "update", to: "map", label: "replace canonical value" },
        { from: "update", to: "latest", label: "take maximum timestamp" },
        { from: "update", to: "min", label: "index candidate" },
        { from: "update", to: "max", label: "index candidate" },
        { from: "map", to: "min", label: "validate correction" },
        { from: "map", to: "max", label: "validate correction" }
      ]
    },
    pseudocode: String.raw`UPDATE(timestamp, price):
  prices[timestamp] = price
  latestTimestamp = max(latestTimestamp, timestamp)
  push (price, timestamp) into minHeap
  push (-price, timestamp) into maxHeap

CURRENT(): return prices[latestTimestamp]

MINIMUM():
  while minHeap.top disagrees with prices at its timestamp: pop
  return minHeap.top.price

MAXIMUM():
  while maxHeap.top disagrees with prices at its timestamp: pop
  return negated maxHeap.top.price`,
    proof: [
      "Replacing prices[timestamp] makes the map reflect exactly the newest correction, and taking a maximum preserves the greatest recorded timestamp for current().",
      "Every current price was pushed into each heap at its latest update, so at least one valid candidate for every record exists in each index.",
      "Lazy cleanup removes only candidates contradicted by the authoritative map; after cleanup, the heap top is both current and no larger or smaller than any other current candidate, so it is the correct extremum."
    ],
    complexity: [
      { operation: "update", time: "O(log u)", reason: "Map replacement is constant average time and each extrema-index insertion is logarithmic in u updates." },
      { operation: "current", time: "O(1) average", reason: "The latest timestamp is maintained directly and then looked up in the map." },
      { operation: "maximum / minimum", time: "O(log u) amortized in Python; O(1) query in C++", reason: "Each stale heap record is popped once; multiset endpoints are direct after correction-time maintenance." },
      { operation: "space", time: "O(u) Python or O(t) C++", reason: "Lazy heaps retain update records, while the multiset stores one entry per distinct timestamp t." }
    ],
    python: String.raw`import heapq


class StockPrice:
    def __init__(self):
        self.prices = {}
        self.latest_timestamp = 0
        self.minimum_heap = []
        self.maximum_heap = []

    def update(self, timestamp: int, price: int) -> None:
        self.prices[timestamp] = price
        self.latest_timestamp = max(self.latest_timestamp, timestamp)
        heapq.heappush(self.minimum_heap, (price, timestamp))
        heapq.heappush(self.maximum_heap, (-price, timestamp))

    def current(self) -> int:
        return self.prices[self.latest_timestamp]

    def maximum(self) -> int:
        while True:
            negative_price, timestamp = self.maximum_heap[0]
            price = -negative_price
            if self.prices[timestamp] == price:
                return price
            heapq.heappop(self.maximum_heap)

    def minimum(self) -> int:
        while True:
            price, timestamp = self.minimum_heap[0]
            if self.prices[timestamp] == price:
                return price
            heapq.heappop(self.minimum_heap)`,
    cpp: String.raw`#include <algorithm>
#include <set>
#include <unordered_map>
using namespace std;

class StockPrice {
    unordered_map<int, int> prices;
    multiset<int> orderedPrices;
    int latestTimestamp = 0;

public:
    StockPrice() = default;

    void update(int timestamp, int price) {
        auto found = prices.find(timestamp);
        if (found != prices.end()) {
            orderedPrices.erase(orderedPrices.find(found->second));
        }

        prices[timestamp] = price;
        orderedPrices.insert(price);
        latestTimestamp = max(latestTimestamp, timestamp);
    }

    int current() {
        return prices[latestTimestamp];
    }

    int maximum() {
        return *orderedPrices.rbegin();
    }

    int minimum() {
        return *orderedPrices.begin();
    }
};`
  }
};
