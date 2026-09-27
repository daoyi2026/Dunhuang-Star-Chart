let paper;
let groups = [];
let farStars = [];
let diamondStars = [];
let dust = [];
let meteors = [];
let rings = [];
let mistStars = [];
let starTrails = [];

let clock = 0;
let paused = false;
let chosen = -1;
let hoverId = -1;
let sceneScale = 1;
let ox = 0;
let oy = 0;

const W = 1440;
const H = 810;
const BW = 1000;
const BH = 760;
const SX = W / BW;
const SY = H / BH;
const SS = Math.min(SX, SY);
const tx = (value) => value * SX;
const ty = (value) => value * SY;
const ts = (value) => value * SS;

const names = [
  '紫微', '北斗', '天棓', '华盖', '天厨', '传舍', '天柱', '文昌',
  '三师', '太尊', '天牢', '内阶', '天床', '八谷', '天理', '六甲',
  '勾陈', '北极', '天皇', '五帝', '尚书', '女史', '柱史', '御女',
  '天枪', '玄戈', '三公', '相', '紫微垣'
];

const notes = {
  '紫微': '古人以为中天帝座之域，万星拱卫，象征天极与帝居。',
  '北斗': '《天官书》：“斗为帝车，运于中央，临制四乡。”',
  '天棓': '古人以其近紫微、北斗，视为天帝近卫之象。',
  '华盖': '华盖如帝王车盖覆于天上，古人以为尊位与护卫之象。',
  '天厨': '古人以为天上庖厨之府，象征饮食、供奉与丰饶。',
  '传舍': '古人以为宾客、使者往来住宿之所，象征行旅与驿传。',
  '天柱': '古人取擎天之柱意，象征支撑、纲纪与镇守。',
  '文昌': '文昌近北斗，古人以其象征文教、典章与禄位。',
  '三师': '古人以为太师、太傅、太保之象，主辅政与教化。',
  '太尊': '古人以其近帝座，寓尊位、威仪与秩序。',
  '天牢': '古人以为天上牢狱之象，关联法禁、约束与刑罚。',
  '内阶': '古人以为宫廷内部阶陛，象征朝仪与等级。',
  '天床': '古人以为天上寝床之象，主起居与安息。',
  '八谷': '古人以八谷星占谷物丰歉，与农事、收成相关。',
  '天理': '古人以其寓天之条理、法度与秩序。',
  '六甲': '古人以六甲关联宿卫、符命与兵事。',
  '勾陈': '勾陈环卫紫微，古人以其象征帝宫宿卫与权柄。',
  '北极': '古人以北极为天之枢纽，众星环绕而行。',
  '天皇': '古人以其为至尊之象，与天命、统御相关。',
  '五帝': '古人以五帝对应五方、五德与四时运行。',
  '尚书': '古人以为天上尚书之象，主典籍、政令与文书。',
  '女史': '古人以为内廷掌记之官，主记事与礼仪。',
  '柱史': '古人以柱史掌图籍、记录之职，寓守典记事。',
  '御女': '古人以为帝宫近侍之象，与内廷侍从相关。',
  '天枪': '古人以为天上兵器之象，主警戒、武备与护卫。',
  '玄戈': '玄戈为兵戈之象，古人以其关联征伐与守卫。',
  '三公': '古人以三公象朝廷最高辅弼之臣，主辅政与教化。',
  '相': '古人以相星象宰辅之位，寓佐政与调和。',
  '紫微垣': '紫微垣被视为天帝宫阙所在，群星环列，如天上朝廷。'
};

const details = {
  '紫微': '《史记·天官书》与《晋书·天文志》把北极周围称作紫宫，紫宫垣十五星在北斗之北，以紫微为大帝之座、天子常居，主命与度数。东西两列如宫墙，星官各有职掌，南向设门。古人把它画成天上宫城，不只是为了辨认北天方位，也借星位安排君臣、出入与政令的秩序。',
  '北斗': '北斗七星居太微之北，是古人观天授时的枢机。斗魁四星为旋璣，斗柄三星为玉衡，随四时运行而指示方向，因而被说成可以建四时、均五行。它又像帝王所乘之车，柄端所向仿佛号令所及。古籍还把七星分别配以天、地、人、时、音、律与星，显示北斗既是天上的尺度，也是人间政治与农时的象征。',
  '天棓': '天棓多作五星，位于紫宫右侧、女床附近。古人把它看作天子先驱，既有驱车开道之意，也承担防备非常、收摄兵戈的想象。《晋书》将它与争讼、刑罚相联系，《观象玩占》又说它主禁暴、防不虞。它并非单纯的凶象，而是把宫城外的警戒、武备与秩序画成一组可见的星官。',
  '华盖': '华盖是紫微宫中的覆盖之象，古籍说大帝座上有九星，如车盖遮蔽帝座，盖下另有九星为杠，合起来形成有盖有柄的仪仗。它把天上的圆盖与人间帝王出行的车舆联系起来，因此既有尊位、庇护之意，也有宫廷仪仗与天子威仪的意味。星图中它位于北极宫城上方，像一重静静张开的华盖。',
  '天厨': '天厨在紫微垣东北维外，古籍以六星为天子与百官的膳厨，主盛馔、供御膳。它和内厨一内一外：内厨偏向后妃、太子宴饮，天厨则更像宫廷与百官共享的庖厨机构。古人把饮食写入天文，并不是琐碎点缀，而是把国家礼制、供奉和丰饶都纳入天帝宫城的日常秩序。',
  '传舍': '传舍九星列在华盖之上、靠近天河，古籍把它解释为宾客往来的馆舍。宫廷有门墙，也必须有接待使者、安置远客的驿馆，因此传舍成为紫微宫外向人间的通道。古占又说客星守在这里，可能关联使者、边患或胡兵之事。它让星图不只表现皇宫中心，也留下旅途、外交和消息流动的方向。',
  '天柱': '天柱在紫微垣东垣之下，古籍以五星为象，主建政教、悬图法。柱是支撑，也是标示秩序的界面；在天上，它承担维系宫城与政令的象征。古人把法律、图籍和教化写成悬置于天柱之上的制度，意味着人间的制度若要成立，必须像柱一样有根、有尺度，也能让众人仰见。',
  '文昌': '文昌六星在北斗魁前，古籍称为天之六府，主计天下事。六星分别被配作上将、次将、贵相、司禄、司命与司寇，兼有武备、文书、俸禄、灾异和刑狱等职掌。它像一座缩小的官署，说明古代星官并非只按形状命名，而是把朝廷的行政分工投射到夜空之中。文昌明润，常被视作文教、政务与秩序清明的象征。',
  '三师': '三师常与三公相通，位在北斗魁西或斗柄附近。古籍把它比作太师等辅弼之臣，主宣德化、调七政、和阴阳。三师的重点不在武力，而在辅佐与调和：它把天象的运行理解为需要有人校正、协调的政务。星图中三颗星相互照应，像三位近臣分列帝座之外，共同维持天上秩序的平衡。',
  '太尊': '太尊一星位于三台附近，古籍以它象征贵戚、尊亲之位。它不像北斗那样主持四时，也不像文昌那样分掌官府，而是靠近中枢、代表与帝室相亲的身份。这样的命名把宫廷中的亲疏、尊卑和礼制关系也纳入星官系统，使北天星图呈现出一套完整的政治社会结构。',
  '天牢': '天牢六星在北斗魁下，古籍称为贵人之牢，主绳愆、禁暴与收束过失。它不是现实牢狱的地图，而是把执法、约束和贵族犯禁的想象放在帝座附近。天牢与天理相邻，一边强调关押与禁制，一边强调审理与法度，共同表现古人对天上秩序能够纠正人间失序的信念。',
  '内阶': '内阶六星在文昌之北，古籍称作天皇之阶，也说是上帝幸文馆时所行的阶道。阶有升降之义，连接宫门、明堂与文馆，因而不只是建筑形象，也象征由下而上、由人臣通达天听的秩序。它位于文昌附近，使文书、礼制和朝廷进退都被安排在紫微宫的空间结构中。',
  '天床': '天床六星在紫微宫门外，主寝舍、解息与燕休。古人并未把天帝想象成永远端坐不动的神灵，而是为宫城安排了休息、宴饮和起居之所。天床因此带有柔和的生活气息，与天柱、尚书等官署星官相对：一边是政令和法度，一边是夜间安息与日常起居，共同构成完整的天上宫廷。',
  '八谷': '八谷八星在华盖西、五车北，古籍以它们分别象征稻、黍、大麦、小麦、大豆、小豆、粟与麻，并用来候察岁时丰歉。它把农业经验直接写进北天星图：不同谷物各有位置，星色与明暗也可以成为观察年景的想象线索。八谷不是抽象的吉祥纹样，而是农事、粮食和国家生计在天上的对应物。',
  '天理': '天理四星在北斗魁中，古籍称为贵人之牢，也是执法决狱之官。这里的“理”既是治理，也是辨析曲直；星官因此承担审理贵臣、纠正失序的象征职能。它与天牢相近，却不等同于囚禁本身：天牢收束过犯，天理判断是非。古人借两组星名，把刑法制度和天命秩序连接起来。',
  '六甲': '六甲六星位于华盖之旁，古籍说它可以分阴阳、配节候、布政教，并敬授民时。六甲与历法、干支和农时相连，代表把天上的运行转译成百姓可以遵循的年月节令。它靠近帝座，不只是侍卫或仪仗，也像一套悬在宫城旁的时间标尺，提醒统治者顺应天时、安排政令与耕作。',
  '勾陈': '勾陈六星与北极同在紫宫之中，古籍把它视作后宫、大帝正妃和帝居常处的象征。勾陈的形态如环卫之列，既有围护北极的空间意味，也有后宫内廷与帝室家属的秩序意味。它让紫微垣不只是一座男性官署组成的天宫，也包含居处、家室和守卫中心的另一层结构。',
  '北极': '北极五星是北辰最尊的一组星，古籍以其中的枢星比作天之枢纽，强调极星居其所而众星共之。其余星位又被分别联系到太子、帝王和庶子，形成围绕天极展开的家国秩序。北极的意义不只在于它看起来不动，更在于古人以它建立方向、历法和王权中心，让流转的群星有了可归依的轴心。',
  '天皇': '天皇大帝一星在勾陈口中，古籍说其神名耀魄宝，主御群灵、执万神图。它像紫宫门内的最高神职，不直接表现某一项日常事务，而是统摄群灵、掌握神明名籍。天皇与北极、勾陈相邻，使星图中的中央宫城形成天极、帝居与神权相互环抱的结构，也反映了古人把天象与礼制、祭祀紧密相连的观念。',
  '五帝': '五帝内座五星位于华盖之下，古籍说这里是五帝集议、安坐和安排秩序的所在。五帝分别联系五方、五德与四时，象征不同方向的力量在中央汇聚。它不是单独一位帝王的座席，而是一个多重秩序相会的内廷空间：星位若明，便意味着四时、五行和政治运行能够保持协调。',
  '尚书': '尚书五星在紫微宫门内东南维，古籍以它们象征掌纳言、出纳诏令和夙夜咨谋的官署。尚书并不只是保管文书，更承担把君意转成政令、把群臣意见带回中枢的往返职能。它与文昌、内阶相连，说明天上宫城的文字、议政和升降通达都有对应的星位，构成一套完整的文治图景。',
  '女史': '女史一星在柱下史之北，古籍称其为掌记禁、传漏的内廷女官，类似汉代侍史。她负责记录与传递时间，也守护宫中不宜外传的消息。星官位置靠近柱下史，正好把“记过”与“传漏”并列起来：一个记录言行，一个传递时刻，共同显示古人对宫廷记事、值守和时间秩序的重视。',
  '柱史': '柱下史一星在紫微宫东侧，古籍说它主记过，象征左右史官记录帝王言行。柱既是支撑宫城的形象，也是竖立在宫门旁的记事标志；柱下史因此带有监察、存档和使过失可考的意味。它与女史一南一北相邻，前者记录政事，后者传递禁中消息，把书写和传达都放入天上官署的秩序。',
  '御女': '古籍多作“女御”，列在紫宫内廷，取后宫嫔御与帝室妻妾之象。它不像天皇、北极那样代表天极核心，也不像尚书那样掌政令，而是表现宫中亲近、侍从与家室关系。星官的设置说明古人观察天象时，会把内廷生活、婚姻秩序和后宫编制一并投射到紫微宫的星群之中。',
  '天枪': '天枪三星在北斗柄东，古籍又称天钺，是紫宫左右的天之武备，主御难、备非常。它与天棓同属守卫性质，却更像主动架起的兵器，守护宫城边界。星名里的枪与钺都带有锋刃和权柄的意味，说明古人把北天帝宫想象成一座有门、有墙、有仪仗，也有武备和警戒的完整宫城。',
  '玄戈': '玄戈一星在招摇北，古籍又称元戈、天戈，取兵器之形。它位于北斗杓端附近，与天枪、天棓共同构成北天武备的想象系统。古人借戈矛观察方向，也借它们表达防守、警戒和边界意识；玄戈并非单独主战的凶星，而是把帝宫外沿的锋芒、守卫与非常之备凝成一颗孤清的星。',
  '三公': '三公三星位于北斗杓南，古籍把它们比作太尉、司徒、司空等辅政大臣，主宣德化、调七政、和阴阳。三公的职责不是发号施令，而是承接天子、协调政务，使四时和五行能够各得其序。它与三师有异名同象的说法，反映古代星官会把不同官制和同一组星位互相参照。',
  '相': '相一星在北斗之南，古籍称它总领百司、掌邦教、集众事，以辅帝王安邦国。相是天上宰辅的单星象征，位置靠近北斗，也就靠近号令四方的中枢。它不直接代表某一部具体官署，而是把汇总百官、平衡政务、安定国家的功能集中到一颗星上，故星明被视为辅政得力、秩序清明。',
  '紫微垣': '紫微垣在北斗之北，东西两蕃共十五星，古籍以它为大帝之座、天子常居，左右环列如翊卫之象。垣墙、宫门、天柱、尚书、天床、天厨等星官共同组成一座可以辨认的天上宫城：有中枢、有官署、有寝舍、有供膳，也有传舍和武备。敦煌星图把这套秩序绘在卷面上，既是观测北天的图式，也是唐人理解帝国、礼制与宇宙中心的视觉隐喻。'
};

const detailExtensions = {
  '紫微': '在这套想象里，紫微不是一颗孤立的亮星，而是以北极为轴、以垣墙为界的中天宫城。星官的明暗、出入和相对位置，都被赋予了礼制与政务的意味；因此古星图既可用来辨方定位，也像一幅把天象、宫室和国家秩序叠在一起的宇宙地图。',
  '北斗': '《晋书》还把斗柄的转向与建时、授历联系起来，认为观察它便能知道季节推移。后世占书所说的“七政”与“帝车”，都在强调北斗兼具时间尺度和政治象征：它既让夜行者找到方向，也让农人安排耕作，让王者被提醒要顺天时而行。',
  '天棓': '这类记载并不等于把它简单判作凶星，而是把天棓放在宫城防线与军政秩序中理解。它和天枪、玄戈相互参看，形成由近卫、兵器到边界的连续意象；星明则被寄托为警备有常，星失其度则引发对争端、兵事和制度失守的忧惧。',
  '华盖': '《灵台秘苑》一类占书仍沿用车盖、盖杠的解释，使华盖兼有建筑与仪仗两层含义。它遮护的不是普通车乘，而是天帝之座；所以华盖周围的星位常被看作贵人、侍从和出行仪卫的排列，也把“居中而受护”的观念具体化为一组可观的星形。',
  '天厨': '从星官制度看，天厨说明天宫并非只有神圣的中心，还需要供膳、储藏和分配的日常机构。古人把丰歉、饮食与礼祭都纳入占候，正因为粮食关系国家根本；这组星在北天的位置，也因此被赋予观察供给是否充足、宫廷是否安宁的联想。',
  '传舍': '“舍”在古代既指旅馆，也指使者经过时暂留的驿站，因此传舍保存着很强的交通与外交意味。它与天厨、华盖等星官相望，像宫城外的一处接待空间；在星图上留下这条通道，正说明古人把消息、使节、客星与国家边界看成同一套秩序中的流动部分。',
  '天柱': '《灵台秘苑》所载天柱，仍带有“立表、悬法、定制”的意味。它把看不见的制度变成一根可以仰观的柱子：上承天象，下系人间。于是天柱既是宫城的结构件，也是秩序的尺度，和文昌、尚书相邻时，更像连接法度、图籍与政教的一处中枢。',
  '文昌': '这种把六星分别配官的做法，反映了古代星官最有代表性的思路：以朝廷分职解释天上群星，再以天象反观人间政治。文昌明而有序，被寄托为文书清明、官府各得其职；若出现异常，则可引出对政令壅滞、刑赏失平或官署失序的占想。',
  '三师': '古籍中“三师”有时与“三公”互见，名称随时代和星官体系而变化，但核心都在辅弼、教化与调和。把三颗星并列，像是把一项复杂政务拆成三种相互制衡的力量：辅导君上、整饬礼法、协调阴阳。它因而更接近理想政治的象征，而不是单纯的官名排列。',
  '太尊': '“尊”字本身带有亲近而贵重的身份意味，说明太尊不是普通侍从，也不是外朝武官，而是位于中枢附近的贵戚之象。古人以星位远近安排尊卑，把宫廷中的亲亲、长幼与礼序投射到天空；太尊与三台、紫微诸星相参时，便形成一层内向的尊位结构。',
  '天牢': '古代占星并不只讨论灾祥，也借星官说明一套可以约束权力的制度。天牢位近北斗，意味着连贵人也受法禁所摄；它和天理一组一收一断，将拘禁、审理、刑罚与秩序连接起来。这样的星名让天宫不只是权力中心，也具有纠正过失、限制暴行的司法想象。',
  '内阶': '阶道连接不同等级的空间，古人遂把它理解为入朝、升陛和通达天听的象征。内阶靠近文昌，说明文臣、典籍与礼仪有一条共同的进入中枢之路；它不是宫殿装饰，而是把“谁可以进、如何进、在何处停步”的制度关系，写成北天一段有方向的星列。',
  '天床': '天床与天厨、内厨相邻时，构成了天宫中起居与饮食的生活面。古籍把帝居写得有休息、有宴饮，并非降低天帝的神圣性，而是以人间宫廷熟悉的秩序去解释不可见的天界。它也提醒观者，星官体系同时保存了古人对夜禁、值宿和宫门内外的想象。',
  '八谷': '八谷所对应的谷物名称，体现出星占与农政之间的紧密关系。古人观察星色、星位与季节，并不意味着形成现代意义的气象预测，而是用天象记录丰歉经验、提醒国家重视仓廪。它和六甲、五帝等星官相看，便把历法、土地、粮食与政治责任串成一条线索。',
  '天理': '“理”在古汉语中既有条理，也有治狱、辨曲直之意，所以天理兼具法则与官职两重含义。它位于北斗魁内，像在帝车附近设下审理之所；与天牢并观，便能看出古人将权力、法律和天命放在同一张星图里，要求中枢既能发令，也能自我约束。',
  '六甲': '六甲还与干支、历数和符命相连，因而兼有时间系统与护卫系统的意味。它位于华盖附近，好像随仪仗而行的历法标记：一面记录年月节候，一面提醒宫城和军旅遵守时序。古籍借它表达的不是玄秘数字本身，而是以天时安排政令、农作与出行的观念。',
  '勾陈': '勾陈的环卫形态，使它同时具备星群形状和内廷制度的双重解释。古籍所说的后宫、正妃与帝居，并非单指某个人，而是把家室、继承和中心守护纳入帝宫结构。它围住北极，也就把“天极不可犯”的空间感转换成有门、有墙、有内外之分的宫廷图景。',
  '北极': '由于北极在肉眼观感上近乎不动，它很早便成为辨方、定向和纪时的参照。古籍进一步把围绕它的星位配作帝、太子与庶子，使天文学上的中心获得家国伦理的解释。北极因此既是观测工具，也是政治寓言：万星可以运行变化，但中枢必须保持可辨、可归和有序。',
  '天皇': '“耀魄宝”等神名，使天皇大帝带有古代祭祀与神谱的色彩。它位于勾陈口中，位置像是从内廷通向群神的门槛；由此可见，紫微宫在古人心中既是帝王的朝廷，也是神灵名籍与宇宙权柄的管理处。星官的安排把礼仪、神权和天象共同收束到中央。',
  '五帝': '五帝内座把五方、五行和四时的观念聚到中天附近，形成“多方汇于中央”的结构。古籍中的五帝并不只是一组神名，也是一种解释世界的秩序：东方、南方、西方、北方与中央各有德性和职责，彼此会于内座，才使季节、政教与万物运行获得平衡。',
  '尚书': '尚书星官尤其强调“出纳王命”的中介作用：政令从中枢发出，也需要经过记录、传达与执行才能抵达人间。它与文昌、柱史、内阶相互勾连，像一条由书写到决策、再由决策到传达的制度链。古人将这条链绘在星空中，正是把文字视为维持国家秩序的力量。',
  '女史': '女史所掌的记禁、传漏，说明内廷也有严格的值守与信息制度。她与柱下史分列，呈现外朝记录与内廷传递之间的分工；这不是对某位历史人物的指认，而是古人用熟悉的官职名称去组织夜空。星位越近宫门，越显出记录秘密、守护时间和谨慎传言的意味。',
  '柱史': '柱下史的“记过”使它带有史官和监察者的身份，不只是写字的人。古代宫廷需要有人记录言行，使政事可以追溯、过失可以核验；星官因而成为一种制度理想的投影。与女史、尚书相参，它把记录、传递和发布三种文书职能排列在紫微宫边缘。',
  '御女': '“女御”一名在古代宫廷制度中有明确的内廷位置，星官取其名，便把侍从、婚姻与家室礼秩纳入天宫。它的意义不在于描写个人私事，而在于显示紫微垣有内外、尊卑和职掌之分；和女史、天床相参，能看见一套关于值守、起居与宫门秩序的完整侧影。',
  '天枪': '《开元占经》所保存的兵备类解释，使天枪不只是一组三星的形状名称。它与天棓、玄戈分列，像宫城周围不同方向的警戒设施；“御难、备非常”的语义，也说明古人更关心守护和应变，而不是把兵器简单等同于战争。星图中的锋芒最终服务于中心的安定。',
  '玄戈': '戈是古代常见的长柄兵器，兼有攻击、拒守和辨向的象征。玄戈位置靠近斗杓，使它像帝车外沿的一枚警戒标记；相关占书常把它与兵戈、边患和守备相连，但这些解释仍依赖星色、运行和时代语境。敦煌画面取其孤锋与肃静感，保留的是古人对边界的想象。',
  '三公': '三公星所承载的，是辅佐而非僭越的政治理想。太尉、司徒、司空分掌军政、教化与土地民事的传统官制，被古人借来解释三颗相近的星。它与三师互见，说明星官名称会随典籍和制度变迁而调整，但“以群臣和阴阳、成天子之治”的核心观念始终相近。',
  '相': '相星把“总领百司”浓缩为一颗星，和三公的群体辅弼形成一单一群的对照。它靠近北斗，位置上的接近强化了宰辅承接帝命、统合政务的意味；古籍所说星明、星暗的占候，实际寄托的是对辅政得失、百官是否协同以及国家是否安定的观察。',
  '紫微垣': '《晋书》把垣内诸星分别配作帝座、后宫、官署、寝舍、厨膳与武备，使紫微垣成为一座分工细密的天上都城。不同典籍的星数和名称偶有差异，但共同保留了“北极为中、群星为臣、宫墙有序”的结构。敦煌图像把这种结构转译成卷轴上的边界、道路与星列，让观者既看见宇宙中心，也看见古人心中的国家形制。'
};

const sources = {
  '紫微': '据《史记·天官书》《晋书·天文志》整理',
  '北斗': '据《史记·天官书》《晋书·天文志》整理',
  '天棓': '据《史记·天官书》《晋书·天文志》整理',
  '华盖': '据《晋书·天文志》《灵台秘苑》整理',
  '天厨': '据《晋书·天文志》《宋史·天文志》整理',
  '传舍': '据《晋书·天文志》整理',
  '天柱': '据《晋书·天文志》《灵台秘苑》整理',
  '文昌': '据《史记·天官书》《灵台秘苑》整理',
  '三师': '据《晋书·天文志》《灵台秘苑》整理',
  '太尊': '据《灵台秘苑》整理',
  '天牢': '据《晋书·天文志》《隋书·天文志》整理',
  '内阶': '据《晋书·天文志》《观象玩占》整理',
  '天床': '据《晋书·天文志》《宋史·天文志》整理',
  '八谷': '据《宋史·天文志》《观象玩占》整理',
  '天理': '据《史记·天官书》《晋书·天文志》整理',
  '六甲': '据《晋书·天文志》《灵台秘苑》整理',
  '勾陈': '据《晋书·天文志》整理',
  '北极': '据《晋书·天文志》整理',
  '天皇': '据《晋书·天文志》《宋史·天文志》整理',
  '五帝': '据《晋书·天文志》《灵台秘苑》整理',
  '尚书': '据《晋书·天文志》《灵台秘苑》整理',
  '女史': '据《晋书·天文志》《灵台秘苑》整理',
  '柱史': '据《晋书·天文志》《灵台秘苑》整理',
  '御女': '据《灵台秘苑》整理',
  '天枪': '据《史记·天官书》《晋书·天文志》整理',
  '玄戈': '据《史记·天官书》《开元占经》整理',
  '三公': '据《晋书·天文志》《灵台秘苑》整理',
  '相': '据《晋书·天文志》整理',
  '紫微垣': '据《晋书·天文志》《灵台秘苑》整理'
};

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('app');
  canvas.elt.addEventListener('pointerdown', handleCanvasPointer, { passive: true });
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  paper = createGraphics(W, H);
  paper.pixelDensity(1);
  makePaper();

  randomSeed(412086939);
  makeStars();
  makeSky();
  makeMeteors();

}

function h(number) {
  const value = Math.sin(number * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function makePaper() {
  randomSeed(731);
  noiseSeed(731);
  paper.background(19, 17, 14);
  paper.noStroke();

  for (let i = 0; i < 110; i += 1) {
    const x = random(-W * 0.1, W * 1.1);
    const y = random(-H * 0.1, H * 1.1);
    const rw = random(ts(100), ts(330));
    const rh = rw * random(0.35, 1.4);
    const kind = random();

    if (kind < 0.5) {
      paper.fill(random(74, 102), random(52, 72), random(30, 45), random(3, 8));
    } else if (kind < 0.8) {
      paper.fill(random(103, 125), random(72, 88), random(42, 54), random(2, 6));
    } else {
      paper.fill(0, 0, 0, random(3, 9));
    }

    paper.ellipse(x, y, rw, rh);
  }

  for (let i = 0; i < 1600; i += 1) {
    const warm = random() < 0.65;
    paper.fill(
      warm ? random(145, 195) : 0,
      warm ? random(112, 155) : 0,
      warm ? random(70, 108) : 0,
      random(2, 9)
    );
    paper.circle(random(W), random(H), random(ts(0.25), ts(1.25)));
  }

  for (let i = 0; i < 2100; i += 1) {
    const x = random(W);
    const y = random(H);
    const length = random(ts(1.4), ts(11));
    const angle = random() < 0.74
      ? random(-0.18, 0.18)
      : HALF_PI + random(-0.22, 0.22);
    const warm = random() < 0.7;

    paper.stroke(
      warm ? 180 : 63,
      warm ? 148 : 50,
      warm ? 103 : 37,
      random(2, 10)
    );
    paper.strokeWeight(random(ts(0.18), ts(0.55)));
    paper.line(x, y, x + cos(angle) * length, y + sin(angle) * length);
  }

  for (let i = 0; i < 170; i += 1) {
    const startX = random(W);
    const startY = random(H);
    const length = random(ts(28), ts(110));
    const angle = random() < 0.72
      ? random(-0.11, 0.11)
      : HALF_PI + random(-0.14, 0.14);
    const phase = random(TWO_PI);
    const wave = random(ts(0.7), ts(2.5));
    let lastX = startX;
    let lastY = startY;

    paper.stroke(194, 162, 115, random(2, 7));
    paper.strokeWeight(random(ts(0.2), ts(0.58)));

    for (let j = 1; j <= 10; j += 1) {
      const t = j / 10;
      const drift = sin(t * TWO_PI + phase) * wave;
      const x = startX + cos(angle) * length * t + cos(angle + HALF_PI) * drift;
      const y = startY + sin(angle) * length * t + sin(angle + HALF_PI) * drift;
      paper.line(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
    }
  }

  // Slightly irregular vertical paper grain: visible enough to read as a scroll,
  // quiet enough to leave the constellations in command.
  for (let i = 0; i < 28; i += 1) {
    const startX = random(-ts(30), W + ts(30));
    const phase = random(TWO_PI);
    const bend = random(ts(0.7), ts(3.2));
    let lastX = startX;
    let lastY = -ts(40);

    paper.stroke(
      random(112, 148),
      random(78, 105),
      random(44, 68),
      random(8, 18)
    );
    paper.strokeWeight(random(ts(0.35), ts(0.9)));

    for (let j = 1; j <= 18; j += 1) {
      const t = j / 18;
      const x = startX + sin(t * TWO_PI + phase) * bend;
      const y = -ts(40) + H * 1.1 * t;
      paper.line(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
    }
  }

  const folds = [47, 205, 398, 607, 799, 957];
  folds.forEach((fold, index) => {
    const x = tx(fold);
    paper.stroke(0, 0, 0, index % 2 === 0 ? 9 : 6);
    paper.strokeWeight(ts(0.9));
    paper.line(x, 0, x + random(-ts(2), ts(2)), H);
    paper.stroke(181, 139, 83, 4);
    paper.strokeWeight(ts(0.45));
    paper.line(x + ts(2), 0, x + ts(2) + random(-ts(1), ts(1)), H);
  });

  for (let i = 0; i < 360; i += 1) {
    const x = random(W);
    const y = random(H);
    paper.stroke(4, 3, 2, random(3, 11));
    paper.strokeWeight(random(ts(0.2), ts(0.62)));
    paper.line(x, y, x + random(-ts(7), ts(10)), y + random(-ts(2), ts(2)));
  }

  paper.noFill();
  for (let i = 0; i < 12; i += 1) {
    const x = random(W);
    const y = random(H);
    const radius = random(ts(35), ts(110));
    paper.stroke(random(55, 80), random(34, 48), random(20, 30), random(2, 6));
    paper.strokeWeight(random(ts(0.35), ts(1.1)));
    paper.ellipse(x, y, radius, radius * random(0.35, 1.4));
  }

  // Dense short fibres and mineral flecks keep the surface visibly papery
  // even after the cool celestial washes are composited above it.
  for (let i = 0; i < 2900; i += 1) {
    const x = random(W);
    const y = random(H);
    const len = random(ts(0.8), ts(7.5));
    const angle = random() < 0.8 ? random(-0.22, 0.22) : HALF_PI + random(-0.22, 0.22);
    const warm = random() < 0.58;
    paper.stroke(
      warm ? random(160, 205) : random(58, 90),
      warm ? random(126, 166) : random(48, 70),
      warm ? random(78, 112) : random(38, 54),
      random(2, 7)
    );
    paper.strokeWeight(random(ts(0.12), ts(0.42)));
    paper.line(x, y, x + cos(angle) * len, y + sin(angle) * len);
  }

  for (let i = 0; i < 520; i += 1) {
    const x = random(W);
    const y = random(H);
    paper.noStroke();
    if (random() < 0.55) paper.fill(201, 169, 116, random(1.5, 5));
    else paper.fill(2, 3, 4, random(2, 7));
    paper.circle(x, y, random(ts(0.25), ts(1.4)));
  }

  const context = paper.drawingContext;
  const warmGlow = context.createRadialGradient(
    W * 0.5, H * 0.47, ts(30),
    W * 0.5, H * 0.47, W * 0.57
  );
  warmGlow.addColorStop(0, 'rgba(151, 103, 55, .15)');
  warmGlow.addColorStop(0.5, 'rgba(91, 60, 34, .07)');
  warmGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = warmGlow;
  context.fillRect(0, 0, W, H);

  const vignette = context.createRadialGradient(
    W * 0.5, H * 0.48, H * 0.28,
    W * 0.5, H * 0.5, W * 0.84
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.75, 'rgba(0, 0, 0, .04)');
  vignette.addColorStop(0.93, 'rgba(0, 0, 0, .13)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, .24)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, W, H);
}

function makeSky() {
  farStars = [];
  diamondStars = [];
  dust = [];

  for (let i = 0; i < 100; i += 1) {
    farStars.push({
      x: random(ts(16), W - ts(16)),
      y: random(ts(16), H - ts(16)),
      s: random(ts(0.42), ts(1.05)),
      p: random(TWO_PI),
      v: random(0.1, 0.28),
      a: random(22, 52),
      w: random()
    });
  }

  for (let i = 0; i < 64; i += 1) {
    diamondStars.push({
      x: random(ts(20), W - ts(20)),
      y: random(ts(20), H - ts(20)),
      s: random(ts(0.75), ts(1.8)),
      p: random(TWO_PI),
      v: random(0.22, 0.46),
      q: random(0.65, 1),
      r: random(-0.35, 0.35)
    });
  }

  for (let i = 0; i < 180; i += 1) {
    dust.push({
      x: random(W), y: random(H), s: random(ts(0.12), ts(0.5)),
      a: random(2, 8), p: random(TWO_PI), v: random(0.05, 0.15)
    });
  }

  mistStars = [];
  for (let i = 0; i < 720; i += 1) {
    const t = random(-0.08, 1.08);
    const spread = randomGaussian() * ts(58 + 58 * sin(t * PI));
    const tangent = randomGaussian() * ts(34);
    const baseX = lerp(W * 0.05, W * 0.82, t);
    const baseY = lerp(H * 1.04, -H * 0.08, t);
    const dx = 0.78;
    const dy = -0.63;
    mistStars.push({
      x: baseX + (-dy) * spread + dx * tangent,
      y: baseY + dx * spread + dy * tangent,
      s: random(ts(0.16), ts(1.22)),
      a: random(2.5, 15),
      p: random(TWO_PI),
      v: random(0.05, 0.2),
      tone: random()
    });
  }

  starTrails = [];
  for (let i = 0; i < 10; i += 1) {
    starTrails.push({
      cx: W * 0.53 + random(-ts(35), ts(35)),
      cy: H * 0.49 + random(-ts(24), ts(24)),
      rx: ts(115 + i * 42 + random(-12, 14)),
      ry: ts(72 + i * 26 + random(-10, 12)),
      start: random(-PI * 0.95, PI * 0.1),
      span: random(0.42, 1.08),
      phase: random(TWO_PI),
      speed: random(0.012, 0.036),
      tilt: random(-0.14, 0.12)
    });
  }
}

function makeMeteors() {
  meteors = [];
  for (let i = 0; i < 5; i += 1) {
    const fromLeft = random() < 0.76;
    const startX = fromLeft ? random(-W * 0.08, W * 0.04) : random(W * 0.96, W * 1.06);
    const startY = random(H * 0.1, H * 0.4);
    const path = random(ts(145), ts(220));
    const angle = fromLeft ? random(-0.08, 0.18) : PI + random(-0.18, 0.08);
    meteors.push({
      x: startX,
      y: startY,
      vx: cos(angle) * path,
      vy: sin(angle) * path * 0.5,
      period: random(16, 30),
      dur: random(2.2, 3.1),
      off: random(0, 45),
      s: random(ts(1), ts(1.6)),
      seed: random(1e4)
    });
  }
}

function makeStars() {
  const centers = [
    [450, 135], [370, 240], [600, 157], [720, 245], [240, 153], [150, 270],
    [840, 170], [795, 368], [650, 320], [510, 275], [270, 365], [400, 435],
    [570, 445], [700, 505], [850, 530], [180, 480], [485, 570], [550, 355],
    [345, 580], [610, 625], [245, 615], [755, 620], [140, 590], [865, 650],
    [335, 140], [870, 285], [445, 655], [110, 390]
  ];

  groups = [];
  centers.forEach((center, index) => {
    let points = [];
    const count = index === 1 ? 7 : floor(random(3, 7));

    for (let j = 0; j < count; j += 1) {
      const angle = j * 0.95 + random(-0.4, 0.4);
      const radius = random(ts(19), ts(43));
      points.push({
        x: tx(center[0]) + cos(angle) * radius,
        y: ty(center[1]) + sin(angle) * radius,
        r: random(ts(2.2), ts(4)),
        p: random(TWO_PI),
        seed: index * 100 + j * 17 + random(100)
      });
    }

    if (index === 1) {
      points = [[-58, -32], [-28, -21], [0, -6], [26, 8], [47, 37], [19, 55], [-4, 27]]
        .map((point, j) => ({
          x: tx(center[0] + point[0]),
          y: ty(center[1] + point[1]),
          r: ts(3.7),
          p: random(TWO_PI),
          seed: 700 + j * 17 + random(50)
        }));
    }

    groups.push({
      points,
      pts: points,
      name: names[index],
      note: notes[names[index]],
      detail: `${details[names[index]]} ${detailExtensions[names[index]]}`,
      source: sources[names[index]],
      red: index % 4 === 0,
      i: index,
      c: [tx(center[0]), ty(center[1])],
      anchor: [tx(center[0]), ty(center[1])],
      zoom: 1,
      focus: 0,
      light: 0,
      flow: 0
    });
  });

  const wall = [
    [290, 210], [265, 270], [254, 340], [265, 420], [294, 497], [367, 526],
    [455, 520], [545, 539], [630, 568], [704, 546], [708, 464], [690, 396],
    [671, 331], [662, 255], [625, 218]
  ];

  const wallPoints = wall.map((point, index) => ({
    x: tx(point[0]),
    y: ty(point[1]),
    r: ts(4.2),
    p: random(TWO_PI),
    seed: 2800 + index * 19 + random(100)
  }));

  groups.push({
    points: wallPoints,
    pts: wallPoints,
    name: '紫微垣',
    note: notes['紫微垣'],
    detail: `${details['紫微垣']} ${detailExtensions['紫微垣']}`,
    source: sources['紫微垣'],
    red: true,
    i: 28,
    c: [tx(715), ty(438)],
    anchor: [tx(480), ty(395)],
    zoom: 1,
    light: 0,
    flow: 0
  });
}

function draw() {
  const dt = paused ? 0 : Math.min(deltaTime, 50) / 1000;
  clock += dt;

  const mobile = width < 760;
  sceneScale = mobile
    ? Math.max(width / W, height / H) * 0.72
    : Math.min(width / W, height / H);
  ox = (width - W * sceneScale) / 2;
  oy = (height - H * sceneScale) / 2;

  hoverId = hitGroup((mouseX - ox) / sceneScale, (mouseY - oy) / sceneScale);
  cursor(hoverId < 0 ? 'default' : 'pointer');

  background(19, 17, 14);
  const coverScale = Math.max(width / W, height / H);
  image(paper, (width - W * coverScale) / 2, (height - H * coverScale) / 2, W * coverScale, H * coverScale);

  push();
  translate(ox, oy);
  scale(sceneScale);
  textFont('Ma Shan Zheng');
  textAlign(LEFT, BASELINE);

  drawCelestialWash();
  drawMilkyWay();
  drawStarTrails();
  drawDust();
  drawFarStars();
  drawDiamonds();
  drawMeteors();

  const ease = 1 - Math.exp(-dt * 7);
  groups.forEach((group) => {
    const selected = group.i === chosen;
    group.focus = lerp(group.focus || 0, selected ? 1 : 0, ease * 0.72);
    group.zoom = lerp(group.zoom, 1, ease);
    group.light = lerp(group.light, selected ? 1 : (group.i === hoverId ? 0.2 : 0), ease);
    group.flow += dt * (0.27 + group.light * 0.2);
  });

  groups.forEach((group) => {
    if (group.i === chosen) return;
    push();
    drawingContext.globalAlpha = chosen >= 0 ? 0.18 : 1;
    drawGroup(group);
    pop();
  });

  if (chosen >= 0) {
    const selected = groups[chosen];
    drawSelectionAtmosphere(selected);
    drawMotif(selected);
    drawGroup(selected);
  }

  drawRings(dt);
  drawTitles();
  pop();
}

function drawCelestialWash() {
  const ctx = drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const indigo = ctx.createRadialGradient(W * 0.25, H * 0.18, ts(20), W * 0.25, H * 0.18, W * 0.5);
  indigo.addColorStop(0, 'rgba(37, 74, 91, .16)');
  indigo.addColorStop(.44, 'rgba(31, 61, 78, .08)');
  indigo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = indigo;
  ctx.fillRect(0, 0, W, H);

  const violet = ctx.createRadialGradient(W * 0.76, H * 0.18, ts(15), W * 0.76, H * 0.18, W * 0.42);
  violet.addColorStop(0, 'rgba(78, 68, 100, .12)');
  violet.addColorStop(.55, 'rgba(55, 50, 76, .05)');
  violet.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = violet;
  ctx.fillRect(0, 0, W, H);

  const lower = ctx.createLinearGradient(0, H, W, 0);
  lower.addColorStop(0, 'rgba(84, 55, 45, .09)');
  lower.addColorStop(.45, 'rgba(33, 55, 63, .06)');
  lower.addColorStop(1, 'rgba(22, 25, 34, 0)');
  ctx.fillStyle = lower;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawMilkyWay() {
  push();
  blendMode(SCREEN);

  noFill();
  stroke(70, 103, 115, 5.5);
  strokeWeight(ts(88));
  bezier(W * .03, H * 1.06, W * .24, H * .72, W * .47, H * .34, W * .8, -H * .08);
  stroke(101, 87, 111, 3.7);
  strokeWeight(ts(48));
  bezier(W * .06, H * 1.04, W * .28, H * .7, W * .52, H * .3, W * .82, -H * .1);

  noStroke();
  mistStars.forEach((star) => {
    const pulse = .72 + .28 * sin(clock * star.v + star.p);
    let color;
    if (star.tone < .36) color = [111, 151, 157];
    else if (star.tone < .7) color = [125, 112, 145];
    else color = [214, 179, 125];

    fill(color[0], color[1], color[2], star.a * pulse);
    circle(star.x, star.y, star.s * (0.85 + pulse * .25));

    if (star.s > ts(.82) && star.tone > .62) {
      fill(238, 214, 167, star.a * .18 * pulse);
      circle(star.x, star.y, star.s * 5.5);
    }
  });

  blendMode(BLEND);
  pop();
}

function drawStarTrails() {
  push();
  noFill();
  const ctx = drawingContext;
  ctx.save();
  ctx.setLineDash([ts(1.2), ts(5.8)]);

  starTrails.forEach((trail, index) => {
    push();
    translate(trail.cx, trail.cy);
    rotate(trail.tilt);

    stroke(index % 3 === 0 ? 116 : 187, index % 3 === 0 ? 143 : 164, index % 3 === 0 ? 149 : 117, 14 + index * .7);
    strokeWeight(ts(.38));
    arc(0, 0, trail.rx * 2, trail.ry * 2, trail.start, trail.start + trail.span);

    const p = (clock * trail.speed + trail.phase) % 1;
    const angle = trail.start + trail.span * p;
    const x = cos(angle) * trail.rx;
    const y = sin(angle) * trail.ry;
    noStroke();
    fill(235, 213, 165, 24);
    circle(x, y, ts(5.5));
    fill(245, 226, 186, 82);
    circle(x, y, ts(1.05));
    pop();
  });

  ctx.restore();
  pop();
}

function focusEase(group) {
  const t = constrain(group.focus || 0, 0, 1);
  return 1 - pow(1 - t, 3);
}

function focusTransform(group) {
  const f = focusEase(group);
  const mobile = width < 760;
  const targetX = W * .52;
  const targetY = H * (mobile ? .34 : .42);
  const targetScale = group.i === 28 ? (mobile ? .98 : 1.16) : (mobile ? 1.72 : 2.05);
  return {
    f,
    scale: lerp(1, targetScale, f),
    dx: lerp(0, targetX - group.anchor[0], f),
    dy: lerp(0, targetY - group.anchor[1], f)
  };
}

function applyGroupTransform(group) {
  const t = focusTransform(group);
  translate(t.dx, t.dy);
  translate(group.anchor[0], group.anchor[1]);
  scale(t.scale);
  translate(-group.anchor[0], -group.anchor[1]);
}

function transformedPoint(group, point) {
  const t = focusTransform(group);
  return {
    x: group.anchor[0] + (point.x - group.anchor[0]) * t.scale + t.dx,
    y: group.anchor[1] + (point.y - group.anchor[1]) * t.scale + t.dy
  };
}

function drawSelectionAtmosphere(group) {
  const f = focusEase(group);
  if (f < .01) return;

  const t = focusTransform(group);
  const cx = group.anchor[0] + t.dx;
  const cy = group.anchor[1] + t.dy;

  push();
  noStroke();
  for (let i = 5; i >= 0; i -= 1) {
    const r = ts(160 + i * 48) * (group.i === 28 ? 1.28 : 1);
    fill(40, 61, 69, (3.3 + (5 - i) * 1.6) * f);
    ellipse(cx, cy, r * 1.55, r);
  }
  pop();
}

function motifType(name) {
  if (['紫微','紫微垣','勾陈','天皇','五帝'].includes(name)) return 'palace';
  if (name === '北斗') return 'chariot';
  if (name === '华盖') return 'canopy';
  if (name === '天厨') return 'vessel';
  if (['传舍','天床'].includes(name)) return 'pavilion';
  if (name === '天柱') return 'columns';
  if (['文昌','尚书','女史','柱史'].includes(name)) return 'scroll';
  if (name === '内阶') return 'stairs';
  if (name === '八谷') return 'grain';
  if (['天枪','玄戈','六甲'].includes(name)) return 'weapon';
  if (name === '天牢') return 'enclosure';
  return 'orbit';
}

function drawMotif(group) {
  const f = focusEase(group);
  if (f < .035) return;

  push();
  applyGroupTransform(group);
  translate(group.anchor[0], group.anchor[1]);

  const type = motifType(group.name);
  const s = group.i === 28 ? ts(285) : ts(135);
  const alpha = 72 * f;

  if (type === 'palace') drawPalaceMotif(s, alpha);
  else if (type === 'chariot') drawChariotMotif(s, alpha);
  else if (type === 'canopy') drawCanopyMotif(s, alpha);
  else if (type === 'vessel') drawVesselMotif(s, alpha);
  else if (type === 'pavilion') drawPavilionMotif(s, alpha);
  else if (type === 'columns') drawColumnMotif(s, alpha);
  else if (type === 'scroll') drawScrollMotif(s, alpha);
  else if (type === 'stairs') drawStairMotif(s, alpha);
  else if (type === 'grain') drawGrainMotif(s, alpha);
  else if (type === 'weapon') drawWeaponMotif(s, alpha);
  else if (type === 'enclosure') drawEnclosureMotif(s, alpha);
  else drawOrbitMotif(s, alpha);

  pop();
}

function motifStroke(alpha, warm = true) {
  noFill();
  stroke(warm ? 226 : 126, warm ? 203 : 151, warm ? 153 : 160, alpha);
  strokeWeight(ts(.58));
}

function drawPalaceMotif(s, alpha) {
  push();
  translate(0, ts(5));
  for (let pass = 0; pass < 2; pass += 1) {
    const a = alpha * (pass === 0 ? .95 : .36);
    const o = pass * ts(1.8);
    motifStroke(a, pass === 0);

    const w = s * .96;
    const h = s * .53;
    line(-w * .46 + o, h * .08, -w * .46 + o, h * .47);
    line(w * .46 + o, h * .08, w * .46 + o, h * .47);
    line(-w * .46 + o, h * .47, w * .46 + o, h * .47);

    beginShape();
    vertex(-w * .54 + o, h * .06);
    vertex(-w * .35 + o, -h * .06);
    vertex(-w * .18 + o, -h * .09);
    vertex(0 + o, -h * .23);
    vertex(w * .18 + o, -h * .09);
    vertex(w * .35 + o, -h * .06);
    vertex(w * .54 + o, h * .06);
    endShape();

    beginShape();
    vertex(-w * .31 + o, h * .11);
    vertex(-w * .2 + o, h * .02);
    vertex(0 + o, -h * .08);
    vertex(w * .2 + o, h * .02);
    vertex(w * .31 + o, h * .11);
    endShape();

    for (let x = -2; x <= 2; x += 1) {
      const px = x * w * .13 + o;
      line(px, h * .11, px, h * .47);
    }

    rectMode(CENTER);
    rect(o, h * .31, w * .18, h * .32);
    line(-w * .43 + o, h * .25, -w * .25 + o, h * .25);
    line(w * .25 + o, h * .25, w * .43 + o, h * .25);

    for (let i = -3; i <= 3; i += 1) {
      const px = i * w * .125 + o;
      line(px - w * .035, h * .5, px, h * .43);
      line(px, h * .43, px + w * .035, h * .5);
    }
  }
  pop();
}

function drawChariotMotif(s, alpha) {
  motifStroke(alpha);
  const y = s * .18;
  ellipse(-s * .25, y, s * .27, s * .27);
  ellipse(s * .2, y, s * .27, s * .27);
  line(-s * .25, y, s * .2, y);
  line(-s * .14, -s * .18, s * .18, -s * .18);
  line(-s * .14, -s * .18, -s * .22, y - s * .09);
  line(s * .18, -s * .18, s * .25, y - s * .08);
  line(s * .1, -s * .18, s * .46, -s * .4);
  line(s * .46, -s * .4, s * .57, -s * .38);
  for (let i = 0; i < 7; i += 1) {
    const a = TWO_PI * i / 7;
    line(-s * .25, y, -s * .25 + cos(a) * s * .12, y + sin(a) * s * .12);
    line(s * .2, y, s * .2 + cos(a) * s * .12, y + sin(a) * s * .12);
  }
}

function drawCanopyMotif(s, alpha) {
  motifStroke(alpha);
  arc(0, -s * .08, s, s * .58, PI, TWO_PI);
  line(-s * .5, -s * .08, 0, s * .03);
  line(s * .5, -s * .08, 0, s * .03);
  line(0, s * .03, 0, s * .52);
  for (let i = -4; i <= 4; i += 1) {
    const x = i * s * .11;
    line(x, -s * .07, x * .72, s * .08);
  }
}

function drawVesselMotif(s, alpha) {
  motifStroke(alpha);
  arc(0, s * .03, s * .7, s * .56, 0, PI);
  line(-s * .35, s * .03, s * .35, s * .03);
  line(-s * .26, s * .23, -s * .18, s * .48);
  line(s * .26, s * .23, s * .18, s * .48);
  arc(-s * .39, s * .05, s * .25, s * .3, HALF_PI, PI + HALF_PI);
  arc(s * .39, s * .05, s * .25, s * .3, -HALF_PI, HALF_PI);
  arc(0, -s * .16, s * .46, s * .18, PI, TWO_PI);
}

function drawPavilionMotif(s, alpha) {
  motifStroke(alpha);
  beginShape();
  vertex(-s * .5, -s * .12);
  vertex(-s * .25, -s * .26);
  vertex(0, -s * .38);
  vertex(s * .25, -s * .26);
  vertex(s * .5, -s * .12);
  endShape();
  line(-s * .36, -s * .08, -s * .3, s * .42);
  line(s * .36, -s * .08, s * .3, s * .42);
  line(-s * .3, s * .42, s * .3, s * .42);
  line(-s * .1, -s * .13, -s * .1, s * .42);
  line(s * .1, -s * .13, s * .1, s * .42);
}

function drawColumnMotif(s, alpha) {
  motifStroke(alpha);
  for (const x of [-s * .24, s * .24]) {
    line(x - s * .08, -s * .42, x + s * .08, -s * .42);
    line(x - s * .11, s * .42, x + s * .11, s * .42);
    line(x - s * .05, -s * .38, x - s * .05, s * .38);
    line(x + s * .05, -s * .38, x + s * .05, s * .38);
  }
  arc(0, -s * .42, s * .72, s * .28, PI, TWO_PI);
}

function drawScrollMotif(s, alpha) {
  motifStroke(alpha);
  rectMode(CENTER);
  rect(0, 0, s * .72, s * .58, s * .05);
  arc(-s * .36, 0, s * .15, s * .58, HALF_PI, PI + HALF_PI);
  arc(s * .36, 0, s * .15, s * .58, -HALF_PI, HALF_PI);
  for (let i = -2; i <= 2; i += 1) {
    line(-s * .22, i * s * .085, s * .22, i * s * .085);
  }
}

function drawStairMotif(s, alpha) {
  motifStroke(alpha);
  let x = -s * .42;
  let y = s * .35;
  for (let i = 0; i < 6; i += 1) {
    const nx = x + s * .14;
    line(x, y, nx, y);
    line(nx, y, nx, y - s * .12);
    x = nx;
    y -= s * .12;
  }
}

function drawGrainMotif(s, alpha) {
  motifStroke(alpha);
  line(0, s * .45, 0, -s * .45);
  for (let i = 0; i < 6; i += 1) {
    const y = s * .3 - i * s * .12;
    const side = i % 2 === 0 ? -1 : 1;
    arc(side * s * .1, y, s * .24, s * .13, side < 0 ? -HALF_PI : HALF_PI, side < 0 ? HALF_PI : PI + HALF_PI);
  }
  line(-s * .24, s * .42, 0, -s * .02);
  line(s * .24, s * .42, 0, -s * .02);
}

function drawWeaponMotif(s, alpha) {
  motifStroke(alpha);
  line(-s * .42, s * .4, s * .3, -s * .34);
  beginShape();
  vertex(s * .3, -s * .34);
  vertex(s * .48, -s * .47);
  vertex(s * .4, -s * .25);
  endShape();
  line(-s * .12, s * .12, s * .04, s * .28);
  line(-s * .04, s * .04, s * .12, s * .2);
}

function drawEnclosureMotif(s, alpha) {
  motifStroke(alpha);
  rectMode(CENTER);
  rect(0, 0, s * .76, s * .62);
  for (let i = -2; i <= 2; i += 1) {
    const x = i * s * .12;
    line(x, -s * .31, x, s * .31);
  }
  line(-s * .38, -s * .12, s * .38, -s * .12);
}

function drawOrbitMotif(s, alpha) {
  motifStroke(alpha * .82, false);
  ellipse(0, 0, s * .9, s * .52);
  ellipse(0, 0, s * .62, s * .88);
  rotate(-.25);
  ellipse(0, 0, s * 1.05, s * .34);
}

function drawDust() {
  noStroke();
  dust.forEach((star) => {
    const pulse = 0.55 + 0.45 * sin(clock * star.v + star.p);
    fill(211, 177, 108, star.a * (0.75 + pulse * 0.5));
    circle(star.x, star.y, star.s);
  });
}

function drawFarStars() {
  noStroke();
  farStars.forEach((star) => {
    const pulse = 0.55 + 0.45 * sin(clock * star.v + star.p);
    const alpha = star.a * (0.76 + pulse * 0.48);
    const size = star.s * (0.92 + pulse * 0.13);
    fill(220, 181, 104, alpha * 0.1);
    circle(star.x, star.y, size * 4);
    fill(star.w > 0.35 ? 230 : 217, star.w > 0.35 ? 195 : 196, star.w > 0.35 ? 123 : 157, alpha);
    circle(star.x, star.y, size);
  });
}

function drawDiamonds() {
  diamondStars.forEach((star) => {
    const raw = Math.max(0, sin(clock * star.v + star.p));
    const flash = pow(raw, 7);
    const brightness = constrain(
      (0.2 + (0.5 + 0.5 * sin(clock * 0.13 + star.p * 0.67)) * 0.14 + flash * 0.9) * star.q,
      0,
      1
    );
    const size = star.s * (0.82 + brightness * 0.48);

    noStroke();
    fill(225, 184, 101, 10 + brightness * 26);
    circle(star.x, star.y, size * (4 + brightness * 2.5));
    fill(248, 219, 151, 72 + brightness * 175);
    push();
    translate(star.x, star.y);
    rotate(star.r);
    beginShape();
    vertex(0, -size * 0.72);
    vertex(size * 0.52, 0);
    vertex(0, size * 0.64);
    vertex(-size * 0.46, 0);
    endShape(CLOSE);
    pop();

    if (brightness > 0.78) {
      stroke(255, 233, 181, (brightness - 0.78) * 430);
      strokeWeight(ts(0.36));
      line(star.x - size * 1.35, star.y, star.x + size * 1.35, star.y);
      line(star.x, star.y - size * 1.35, star.x, star.y + size * 1.35);
      noStroke();
    }
  });
}

function drawMeteors() {
  meteors.forEach((meteor) => {
    const time = (clock + meteor.off) % meteor.period;
    if (time > meteor.dur) return;

    const progress = time / meteor.dur;
    const energy = pow(sin(progress * PI), 1.45);
    if (energy < 0.01) return;

    for (let k = 0; k < 12; k += 1) {
      const lag = k / 11;
      const trailProgress = progress - lag * 0.082;
      if (trailProgress < 0) continue;
      const x = meteor.x + meteor.vx * trailProgress;
      const y = meteor.y + meteor.vy * trailProgress;
      const fade = pow(1 - lag, 2) * energy;
      const size = meteor.s * (0.2 + fade * 0.68);
      noStroke();
      fill(243, 206, 128, fade * 38);
      circle(x, y, size * 1.8);
      fill(252, 233, 186, fade * 112);
      circle(x, y, Math.max(ts(0.18), size * 0.58));
    }

    const x = meteor.x + meteor.vx * progress;
    const y = meteor.y + meteor.vy * progress;
    fill(255, 236, 190, 70 + energy * 145);
    push();
    translate(x, y);
    rotate((h(meteor.seed + 1) - 0.5) * 0.55);
    beginShape();
    vertex(0, -meteor.s * 0.82);
    vertex(meteor.s * 0.57, 0);
    vertex(0, meteor.s * 0.72);
    vertex(-meteor.s * 0.5, 0);
    endShape(CLOSE);
    pop();
  });
}

function drawGroup(group) {
  const reveal = constrain((clock - group.i * 0.055) / 3, 0, 1);
  const ink = group.red ? [190, 91, 59] : [195, 171, 128];

  push();
  applyGroupTransform(group);

  if (group.i === chosen) drawAura(group, reveal);

  for (let j = 1; j < group.pts.length; j += 1) {
    const a = group.pts[j - 1];
    const b = group.pts[j];
    const progress = constrain(reveal * (group.pts.length - 1) - (j - 1), 0, 1);
    drawLine(a, b, progress, group.i * 100 + j * 13.7, group.red, group.light);
  }

  if (reveal >= 1) drawFlowingGoldDust(group);

  for (let j = 0; j < group.pts.length; j += 1) {
    const point = group.pts[j];
    const opacity = constrain(reveal * group.pts.length - j, 0, 1);
    if (opacity > 0) drawStar(point, group, opacity);
  }

  if (group.i !== chosen || focusEase(group) < .32) {
    noStroke();
    fill(...ink, (184 + group.light * 71) * reveal * (group.i === chosen ? (1 - focusEase(group)) : 1));
    textSize(group.i === 28 ? ts(18) : ts(15));
    push();
    translate(group.c[0] + ts(29), group.c[1] + ts(24));
    rotate(sin(group.i * 3) * 0.15);
    for (let k = 0; k < group.name.length; k += 1) {
      text(group.name[k], 0, k * ts(16));
    }
    pop();
  }
  pop();
}

function drawAura(group, reveal) {
  const color = group.red ? [219, 119, 77] : [235, 198, 124];
  for (let pass = 0; pass < 4; pass += 1) {
    stroke(...color, (2.5 + pass * 1.5) * reveal);
    strokeWeight(ts(15 - pass * 3));
    for (let j = 1; j < group.pts.length; j += 1) {
      line(group.pts[j - 1].x, group.pts[j - 1].y, group.pts[j].x, group.pts[j].y);
    }
  }

  noStroke();
  group.pts.forEach((point) => {
    fill(...color, 4 * reveal);
    circle(point.x, point.y, point.r * 13);
  });
}

function drawLine(a, b, progress, seed, red, light) {
  if (progress <= 0) return;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = sqrt(dx * dx + dy * dy);
  if (length < 0.001) return;

  const visibleLength = length * progress;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const base = red ? [198, 84, 51] : [205, 178, 123];
  const glow = red ? [255, 166, 89] : [255, 228, 163];
  const step = ts(5);
  const visibleX = a.x + dx * progress;
  const visibleY = a.y + dy * progress;

  // A soft under-stroke keeps each constellation leg readable before the
  // broken ink texture is drawn over it.
  stroke(glow[0], glow[1], glow[2], 18 + light * 42);
  strokeWeight(ts(3.2 + light * 1.1));
  line(a.x, a.y, visibleX, visibleY);

  for (let segment = 0; segment < 80; segment += 1) {
    const start = segment * step;
    if (start >= visibleLength) break;

    const randomSeed = seed + segment * 1.913;
    const segmentLength = ts(2.3) + h(randomSeed + 8) * ts(5.1);
    const end = Math.min(start + segmentLength, visibleLength);
    if (h(randomSeed + 21) < 0.14 && segment % 5 !== 0) continue;

    const jitterStart = (h(randomSeed + 2) - 0.5) * ts(0.6);
    const jitterEnd = (h(randomSeed + 3) - 0.5) * ts(0.6);
    const x1 = a.x + ux * start + px * jitterStart;
    const y1 = a.y + uy * start + py * jitterStart;
    const x2 = a.x + ux * end + px * jitterEnd;
    const y2 = a.y + uy * end + py * jitterEnd;
    const shimmer = 0.5 + 0.5 * sin(clock * 0.6 + randomSeed * 0.045);

    stroke(base[0], base[1], base[2], 108 + light * 88 + shimmer * 28 + h(randomSeed + 55) * 20);
    strokeWeight(ts(0.58) + h(randomSeed + 44) * ts(0.62));
    line(x1, y1, x2, y2);
  }
}

function drawFlowingGoldDust(group) {
  const span = group.pts.length - 1;
  if (span <= 0) return;

  const glow = group.red ? [255, 166, 89] : [255, 228, 163];
  const streams = group.i === chosen ? 2 : 1;
  for (let stream = 0; stream < streams; stream += 1) {
    const head = (group.flow + group.i * 0.37 + stream * span * 0.48) % span;

    for (let k = 14; k >= 0; k -= 1) {
      const position = (head - k * 0.021 + span) % span;
      const index = floor(position);
      if (index < 0 || index >= group.pts.length - 1) continue;

      const fraction = position - index;
      const a = group.pts[index];
      const b = group.pts[index + 1];
      const x = lerp(a.x, b.x, fraction);
      const y = lerp(a.y, b.y, fraction);
      const fade = 1 - k / 15;

      noStroke();
      fill(glow[0], glow[1], glow[2], fade * (150 + group.light * 85));
      circle(x, y, k === 0 ? ts(2.8) + group.light * ts(1.1) : ts(1.15));

      if (k === 0) {
        fill(glow[0], glow[1], glow[2], 26 + group.light * 18);
        circle(x, y, ts(10));
        fill(255, 249, 216, 235);
        circle(x, y, ts(1.45));
      }
    }
  }
}

function drawStar(point, group, opacity) {
  const slow = 0.5 + 0.5 * sin(clock * 0.72 + point.p);
  const flash = pow(Math.max(0, sin(clock * 1.15 + point.p * 1.7)), 9);
  const light = constrain(slow * 0.35 + flash * 0.85 + group.light * 0.72, 0, 1);
  const breath = pow(0.5 + 0.5 * sin(clock * 1.3 + point.p), 4);
  const glow = group.red ? [255, 166, 89] : [255, 228, 163];
  const size = point.r * (1 + group.light * 0.14);

  noStroke();
  fill(
    glow[0], glow[1], glow[2],
    opacity * (4 + breath * 10 + group.light * 9)
  );
  circle(point.x, point.y, size * 9);
  fill(
    glow[0], glow[1], glow[2],
    opacity * (9 + breath * 20 + group.light * 17)
  );
  circle(point.x, point.y, size * 5);

  fill(
    group.red ? 123 + light * 22 : 126 + light * 29,
    group.red ? 48 + light * 11 : 98 + light * 23,
    group.red ? 31 + light * 5 : 62 + light * 15,
    opacity * 235
  );
  blob(point.x, point.y, size, point.seed, 8);
  fill(230, 190, 111, opacity * (122 + light * 125));
  blob(point.x - size * 0.08, point.y - size * 0.12, size * (0.31 + light * 0.05), point.seed + 41, 6);

  if (breath > 0.6 || group.light > 0.1) {
    const flare = Math.max((breath - 0.6) / 0.4, group.light * 0.8);
    stroke(glow[0], glow[1], glow[2], opacity * flare * 155);
    strokeWeight(ts(0.55));
    const ray = size * (1.5 + flare);
    line(point.x - ray, point.y, point.x + ray, point.y);
    line(point.x, point.y - ray, point.x, point.y + ray);
    noStroke();
    fill(255, 249, 222, opacity * flare * 255);
    circle(point.x - ts(0.3), point.y - ts(0.4), ts(1.5));
  }
}

function blob(x, y, radius, seed, sides) {
  beginShape();
  for (let i = 0; i < sides; i += 1) {
    const angle = TWO_PI * i / sides;
    const irregular = 0.78 + h(seed + i * 9.73) * 0.44;
    const squash = 0.88 + h(seed + 70 + i) * 0.16;
    vertex(x + cos(angle) * radius * irregular, y + sin(angle) * radius * irregular * squash);
  }
  endShape(CLOSE);
}

function drawRings(dt) {
  for (let i = rings.length - 1; i >= 0; i -= 1) {
    const ring = rings[i];
    ring.age += dt;
    const alpha = 30 * Math.max(0, 1 - ring.age / 1.6);
    noFill();
    stroke(224, 181, 102, alpha);
    strokeWeight(ts(0.42));
    circle(ring.x, ring.y, ts(7) + ring.age * ts(80));
    if (ring.age > 1.6) rings.splice(i, 1);
  }
}

function drawTitles() {
  // The main typography lives in the DOM layer so it stays crisp on small screens.
  const seal = ts(38);
  const sealX = W - tx(64) - seal;
  const sealY = ty(48);

  push();
  translate(sealX + seal / 2, sealY + seal / 2);
  rotate(-0.025);
  translate(-(sealX + seal / 2), -(sealY + seal / 2));
  noStroke();
  fill(92, 33, 23, 22);
  rect(sealX, sealY, seal, seal, ts(2));
  noFill();
  stroke(180, 79, 49, 205);
  strokeWeight(ts(1.1));
  rect(sealX, sealY, seal, seal, ts(2));
  stroke(180, 79, 49, 120);
  strokeWeight(ts(0.55));
  rect(sealX + ts(3), sealY + ts(3), seal - ts(6), seal - ts(6), ts(1));
  noStroke();
  fill(204, 87, 50, 225);
  textAlign(CENTER, TOP);
  textSize(ts(9.5));
  text('觀星', sealX + seal / 2, sealY + ts(5));
  text('無盡', sealX + seal / 2, sealY + ts(18));
  pop();
}

function hitGroup(x, y) {
  if (x < 0 || x > W || y < 0 || y > H) return -1;

  let best = -1;
  let closest = Math.max(ts(19), 20 / sceneScale);
  const candidates = chosen >= 0 ? [groups[chosen]] : groups;

  for (const group of candidates) {
    const points = group.pts.map((point) => transformedPoint(group, point));

    for (let j = 0; j < points.length; j += 1) {
      let distance = dist(x, y, points[j].x, points[j].y);
      if (j > 0) {
        const a = points[j - 1];
        const b = points[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const denominator = dx * dx + dy * dy;
        const t = denominator > 0
          ? constrain(((x - a.x) * dx + (y - a.y) * dy) / denominator, 0, 1)
          : 0;
        distance = Math.min(distance, dist(x, y, a.x + t * dx, a.y + t * dy));
      }
      if (distance < closest) {
        closest = distance;
        best = group.i;
      }
    }
  }
  return best;
}

function setChosen(index, x = W * 0.5, y = H * 0.5) {
  chosen = index;
  if (index >= 0) {
    rings.push({ x, y, age: 0 });
    if (rings.length > 4) rings.shift();
    window.starChartUI?.select(groups[index]);
  } else {
    window.starChartUI?.select(null);
  }
}

window.starChartSetChosen = setChosen;

function togglePause() {
  paused = !paused;
}

function handleCanvasPointer(event) {
  if (event.button !== undefined && event.button !== 0 && event.button !== -1) return;
  if (window.__starChartUiPointer) return;
  if (document.elementFromPoint(event.clientX, event.clientY)?.closest('.ui-shell')) return;
  const interfaceRegions = document.querySelectorAll('.detail-panel.is-visible');
  for (const region of interfaceRegions) {
    const bounds = region.getBoundingClientRect();
    if (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) return;
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;
  const x = (canvasX - ox) / sceneScale;
  const y = (canvasY - oy) / sceneScale;
  if (x < 0 || x > W || y < 0 || y > H) return;

  const hit = hitGroup(x, y);
  setChosen(hit === chosen ? -1 : hit, x, y);
}

function keyPressed() {
  if (key === ' ') {
    togglePause();
    return false;
  }

  if (key === 'r' || key === 'R') {
    clock = 0;
    rings = [];
    groups.forEach((group) => { group.flow = 0; });
    setChosen(-1);
  }

  if (key === 's' || key === 'S') saveCanvas('敦煌星河遗卷', 'png');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
