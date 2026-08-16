const call = (method, args = [], expected) => expected === undefined ? { method, args } : { method, args, expected };
const approx = value => ({ approx: value });
const oneOf = (...values) => ({ oneOf: values });

export default {
  146: {
    className: "LRUCache", constructor: { types: ["int"], args: [3] },
    methods: { put: { types: ["int", "int"], returns: "void" }, get: { types: ["int"], returns: "int" } },
    calls: [call("put", [7, 70]), call("put", [8, 80]), call("get", [7], 70), call("put", [9, 90]), call("put", [10, 100]), call("get", [8], -1), call("get", [9], 90)]
  },
  460: {
    className: "LFUCache", constructor: { types: ["int"], args: [3] },
    methods: { put: { types: ["int", "int"], returns: "void" }, get: { types: ["int"], returns: "int" } },
    calls: [call("put", [4, 40]), call("put", [5, 50]), call("put", [6, 60]), call("get", [4], 40), call("get", [5], 50), call("put", [7, 70]), call("get", [6], -1), call("get", [7], 70)]
  },
  588: {
    className: "FileSystem", constructor: { types: [], args: [] },
    methods: { mkdir: { types: ["string"], returns: "void" }, addContentToFile: { types: ["string", "string"], returns: "void" }, ls: { types: ["string"], returns: "vector<string>" }, readContentFromFile: { types: ["string"], returns: "string" } },
    calls: [call("mkdir", ["/projects/atlas"]), call("addContentToFile", ["/projects/atlas/readme", "alpha"]), call("addContentToFile", ["/projects/atlas/readme", " beta"]), call("mkdir", ["/projects/demo"]), call("ls", ["/projects"], ["atlas", "demo"]), call("readContentFromFile", ["/projects/atlas/readme"], "alpha beta")]
  },
  604: {
    className: "StringIterator", constructor: { types: ["string"], args: ["a3B2z4"] },
    methods: { hasNext: { types: [], returns: "bool" }, next: { types: [], returns: "char" } },
    calls: [call("hasNext", [], true), call("next", [], "a"), call("next", [], "a"), call("next", [], "a"), call("next", [], "B"), call("next", [], "B"), call("next", [], "z"), call("next", [], "z"), call("hasNext", [], true)]
  },
  1756: {
    className: "MRUQueue", constructor: { types: ["int"], args: [7] },
    methods: { fetch: { types: ["int"], returns: "int" } },
    calls: [call("fetch", [1], 1), call("fetch", [4], 5), call("fetch", [6], 1), call("fetch", [3], 4), call("fetch", [2], 3)]
  },
  346: {
    className: "MovingAverage", constructor: { types: ["int"], args: [4] },
    methods: { next: { types: ["int"], returns: "double" } },
    calls: [call("next", [6], approx(6)), call("next", [-2], approx(2)), call("next", [10], approx(14 / 3)), call("next", [4], approx(4.5)), call("next", [8], approx(5))]
  },
  359: {
    className: "Logger", constructor: { types: [], args: [] },
    methods: { shouldPrintMessage: { types: ["int", "string"], returns: "bool" } },
    calls: [call("shouldPrintMessage", [5, "sync"], true), call("shouldPrintMessage", [7, "sync"], false), call("shouldPrintMessage", [8, "cache"], true), call("shouldPrintMessage", [15, "sync"], true), call("shouldPrintMessage", [17, "cache"], false), call("shouldPrintMessage", [18, "cache"], true)]
  },
  362: {
    className: "HitCounter", constructor: { types: [], args: [] },
    methods: { hit: { types: ["int"], returns: "void" }, getHits: { types: ["int"], returns: "int" } },
    calls: [call("hit", [10]), call("hit", [10]), call("hit", [20]), call("getHits", [100], 3), call("hit", [309]), call("getHits", [309], 4), call("getHits", [310], 2), call("hit", [310]), call("getHits", [610], 0)]
  },
  933: {
    className: "RecentCounter", constructor: { types: [], args: [] },
    methods: { ping: { types: ["int"], returns: "int" } },
    calls: [call("ping", [50], 1), call("ping", [2000], 2), call("ping", [3050], 3), call("ping", [5001], 2), call("ping", [5050], 3)]
  },
  2034: {
    className: "StockPrice", constructor: { types: [], args: [] },
    methods: { update: { types: ["int", "int"], returns: "void" }, current: { types: [], returns: "int" }, maximum: { types: [], returns: "int" }, minimum: { types: [], returns: "int" } },
    calls: [call("update", [5, 11]), call("update", [2, 7]), call("current", [], 11), call("minimum", [], 7), call("update", [5, 4]), call("current", [], 4), call("maximum", [], 7), call("update", [9, 13]), call("maximum", [], 13), call("minimum", [], 4)]
  },
  622: {
    className: "MyCircularQueue", constructor: { types: ["int"], args: [4] },
    methods: { enQueue: { types: ["int"], returns: "bool" }, deQueue: { types: [], returns: "bool" }, Front: { types: [], returns: "int" }, Rear: { types: [], returns: "int" }, isEmpty: { types: [], returns: "bool" }, isFull: { types: [], returns: "bool" } },
    calls: [call("isEmpty", [], true), call("isFull", [], false), call("enQueue", [11], true), call("enQueue", [22], true), call("deQueue", [], true), call("enQueue", [33], true), call("enQueue", [44], true), call("enQueue", [55], true), call("isFull", [], true), call("Front", [], 22), call("Rear", [], 55), call("enQueue", [66], false)]
  },
  705: {
    className: "MyHashSet", constructor: { types: [], args: [] },
    methods: { add: { types: ["int"], returns: "void" }, remove: { types: ["int"], returns: "void" }, contains: { types: ["int"], returns: "bool" } },
    calls: [call("add", [1539]), call("add", [770]), call("contains", [1], false), call("add", [1]), call("remove", [770]), call("contains", [1539], true), call("contains", [770], false)]
  },
  706: {
    className: "MyHashMap", constructor: { types: [], args: [] },
    methods: { put: { types: ["int", "int"], returns: "void" }, get: { types: ["int"], returns: "int" }, remove: { types: ["int"], returns: "void" } },
    calls: [call("put", [1539, 8]), call("put", [770, 21]), call("get", [1], -1), call("put", [1539, 34]), call("remove", [770]), call("get", [1539], 34), call("get", [770], -1)]
  },
  380: {
    className: "RandomizedSet", constructor: { types: [], args: [] },
    methods: { insert: { types: ["int"], returns: "bool" }, remove: { types: ["int"], returns: "bool" }, getRandom: { types: [], returns: "int" } },
    calls: [call("insert", [-7], true), call("insert", [14], true), call("remove", [-7], true), call("insert", [23], true), call("insert", [14], false), call("getRandom", [], oneOf(14, 23))]
  },
  1206: {
    className: "Skiplist", constructor: { types: [], args: [] },
    methods: { add: { types: ["int"], returns: "void" }, search: { types: ["int"], returns: "bool" }, erase: { types: ["int"], returns: "bool" } },
    calls: [call("add", [8]), call("add", [2]), call("add", [8]), call("search", [5], false), call("erase", [8], true), call("search", [8], true), call("erase", [2], true), call("search", [2], false)]
  },
  1603: {
    className: "ParkingSystem", constructor: { types: ["int", "int", "int"], args: [2, 0, 1] },
    methods: { addCar: { types: ["int"], returns: "bool" } },
    calls: [call("addCar", [2], false), call("addCar", [1], true), call("addCar", [1], true), call("addCar", [3], true), call("addCar", [1], false)]
  },
  1396: {
    className: "UndergroundSystem", constructor: { types: [], args: [] },
    methods: { checkIn: { types: ["int", "string", "int"], returns: "void" }, checkOut: { types: ["int", "string", "int"], returns: "void" }, getAverageTime: { types: ["string", "string"], returns: "double" } },
    calls: [call("checkIn", [314, "Quartz", 11]), call("checkIn", [271, "Harbor9", 14]), call("checkOut", [271, "Cedar", 29]), call("checkOut", [314, "Cedar", 34]), call("checkIn", [808, "Quartz", 50]), call("checkOut", [808, "Cedar", 69]), call("getAverageTime", ["Quartz", "Cedar"], approx(21))]
  },
  1797: {
    className: "AuthenticationManager", constructor: { types: ["int"], args: [11] },
    methods: { generate: { types: ["string", "int"], returns: "void" }, renew: { types: ["string", "int"], returns: "void" }, countUnexpiredTokens: { types: ["int"], returns: "int" } },
    calls: [call("generate", ["kiwi", 3]), call("generate", ["plum", 8]), call("renew", ["kiwi", 13]), call("countUnexpiredTokens", [17], 2), call("renew", ["plum", 19]), call("generate", ["mint", 21]), call("countUnexpiredTokens", [24], 1)]
  },
  2043: {
    className: "Bank", constructor: { types: ["vector<long long>"], args: [[91, 4, 207, 63, 18, 0]] },
    methods: { withdraw: { types: ["int", "long long"], returns: "bool" }, transfer: { types: ["int", "int", "long long"], returns: "bool" }, deposit: { types: ["int", "long long"], returns: "bool" } },
    calls: [call("withdraw", [3, 57], true), call("transfer", [1, 6, 90], true), call("deposit", [2, 38], true), call("transfer", [5, 4, 19], false), call("withdraw", [7, 1], false), call("transfer", [6, 5, 44], true), call("deposit", [1, 99], true)]
  },
  2241: {
    className: "ATM", constructor: { types: [], args: [] },
    methods: { deposit: { types: ["vector<int>"], returns: "void" }, withdraw: { types: ["int"], returns: "vector<int>" } },
    calls: [call("deposit", [[3, 2, 0, 1, 2]]), call("withdraw", [870], [-1]), call("withdraw", [750], [0, 1, 0, 1, 1]), call("deposit", [[0, 0, 3, 0, 0]]), call("withdraw", [620], [1, 0, 1, 0, 1])]
  },
  355: {
    className: "Twitter", constructor: { types: [], args: [] },
    methods: { postTweet: { types: ["int", "int"], returns: "void" }, getNewsFeed: { types: ["int"], returns: "vector<int>" }, follow: { types: ["int", "int"], returns: "void" }, unfollow: { types: ["int", "int"], returns: "void" } },
    calls: [call("postTweet", [7, 41]), call("postTweet", [8, 90]), call("follow", [7, 8]), call("getNewsFeed", [7], [90, 41]), call("postTweet", [7, 42]), call("getNewsFeed", [7], [42, 90, 41]), call("unfollow", [7, 8]), call("getNewsFeed", [7], [42, 41])]
  },
  1500: {
    className: "FileSharing", constructor: { types: ["int"], args: [5] },
    methods: { join: { types: ["vector<int>"], returns: "int" }, leave: { types: ["int"], returns: "void" }, request: { types: ["int", "int"], returns: "vector<int>" } },
    calls: [call("join", [[2, 5]], 1), call("join", [[1, 5]], 2), call("request", [2, 2], [1]), call("leave", [1]), call("request", [2, 5], [2]), call("join", [[3]], 1)]
  },
  1912: {
    className: "MovieRentingSystem", constructor: { types: ["int", "vector<vector<int>>"], args: [4, [[0, 7, 8], [1, 7, 6], [2, 7, 6], [1, 9, 5], [3, 9, 4]]] },
    methods: { search: { types: ["int"], returns: "vector<int>" }, rent: { types: ["int", "int"], returns: "void" }, drop: { types: ["int", "int"], returns: "void" }, report: { types: [], returns: "vector<vector<int>>" } },
    calls: [call("search", [7], [1, 2, 0]), call("rent", [2, 7]), call("rent", [3, 9]), call("report", [], [[3, 9], [2, 7]]), call("drop", [3, 9]), call("search", [9], [3, 1])]
  },
  2296: {
    className: "TextEditor", constructor: { types: [], args: [] },
    methods: { addText: { types: ["string"], returns: "void" }, deleteText: { types: ["int"], returns: "int" }, cursorLeft: { types: ["int"], returns: "string" }, cursorRight: { types: ["int"], returns: "string" } },
    calls: [call("addText", ["design"]), call("cursorLeft", [2], "desi"), call("addText", ["er"]), call("deleteText", [3], 3), call("cursorRight", [5], "desgn"), call("cursorLeft", [3], "de")]
  },
  3484: {
    className: "Spreadsheet", constructor: { types: ["int"], args: [4] },
    methods: { setCell: { types: ["string", "int"], returns: "void" }, resetCell: { types: ["string"], returns: "void" }, getValue: { types: ["string"], returns: "int" } },
    calls: [call("setCell", ["C3", 14]), call("getValue", ["=C3+9"], 23), call("setCell", ["A4", 6]), call("getValue", ["=A4+C3"], 20), call("resetCell", ["C3"]), call("getValue", ["=A4+C3"], 6), call("getValue", ["=100+25"], 125)]
  },
  432: {
    className: "AllOne", constructor: { types: [], args: [] },
    methods: { inc: { types: ["string"], returns: "void" }, dec: { types: ["string"], returns: "void" }, getMaxKey: { types: [], returns: "string" }, getMinKey: { types: [], returns: "string" } },
    calls: [call("inc", ["red"]), call("inc", ["red"]), call("inc", ["blue"]), call("inc", ["green"]), call("inc", ["green"]), call("inc", ["green"]), call("getMaxKey", [], "green"), call("getMinKey", [], "blue"), call("dec", ["green"]), call("dec", ["blue"]), call("dec", ["green"]), call("getMaxKey", [], "red"), call("getMinKey", [], "green")]
  }
};
