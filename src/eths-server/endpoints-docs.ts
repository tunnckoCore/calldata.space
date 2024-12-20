export const ENDPOINTS = [
  '',
  'Optimizer for images, using data URI or HTTP URLs',
  '',
  '/optimize/multiple - POST request; pass `files` array of data URIs in JSON request body; or File objects in form-data',
  '/optimize/:modifiers/:url - where `:url` can be data URI or URL, and `:modifiers` are like `f_webp,quality_80,resize_200x100,blur_5`',
  '/optimize/basic/:url - where `:url` can be data URI or URL; basic lossless optimization to WebP using using cwebp',
  '/optimize/basic/https://pbs.twimg.com/profile_banners/896340398/1700609115/1500x500 - basic optimization of a Twitter banner',
  '/optimize/blur_20,resize_500x250/https://pbs.twimg.com/profile_banners/896340398/1700609115/1500x500',
  '',
  '',
  'Checking existence of Ethscriptions',
  '',
  '/exists/:sha - 0x-prefixed or non-prefixed SHA-256 hex string',
  '/check/:sha - alias of above',
  '',
  '',
  'Estimating gas costs',
  '',
  '/estimate - POST request; estimate the cost of creating an Ethscription, pass `data` field in JSON request body',
  '/estimate/:data - could be a dataURI, or 0x-prefixed hex dataURI',
  '/estimate/0x646174613a2c776777 - estimate cost of "data:,wgw"',
  '/estimate/data:,wgw - for simple things, for complex use POST request or hex-encoded dataURI',
  '/estimate/data:,foobie?speed=fast&ethPrice=4000 - use "fast" instead of normal gas price, and custom ETH price',
  '/estimate/data:,foobie?gasPrice=10 - gas price in gwei instead of current prices',
  '/estimate/data:,foobie?baseFee=3217313071&priorityFee=1721711208 - use fees in wei, custom base (3.217 gwei) and priority fees (1.721 gwei)',
  '',
  '',
  'A generation of SHA-256 and resolving of Ethscriptions',
  '',
  '/sha - POST request; pass `data` in JSON request body to generate SHA256 of the data',
  '/sha/:data - create SHA256 of a given data URI (or 0x-prefixed hexed one), also resovles the Ethscription if it exists',
  '/sha?of=data - optionally use the `of` query param to specify the data URI',
  '/sha?of=data:,wgw - generates the SHA256 of that data URI and also resovles the Ethscription',
  '/sha?of=0x646174613a2c776777 - use hex-encoded data URI',
  '/sha/data:,foobarbaz - not exists but generates SHA256 of that data URI',
  '',
  '',
  'Resolve names and ENS - if it is not (on-chain or off-chain) ENS it fallbacks to Ethscription Name',
  '',
  '/resolve/:name - find Ethereum address for any ENS (on-chain or off-chain name) or Ethscription Name',
  '/resolve/0xa20c07f94a127fd76e61fbea1019cce759225002 - resolves the ENS if such exists for this address',
  '/resolve/wgw - find the current owner of an Ethscription Name',
  '/resolve/wgw.lol - if it cannot resolve as off-chain ENS, tries to resolve the Ethscription name',
  '/resolve/foo.bar - resolves nothing, there is no such Ethscription name',
  '/resolve/foo.com - resolves nothing, there is no such off-chain ENS name, nor Ethscription name',
  '/resolve/59.eths - an Ethscription name',
  '/resolve/5848.ethmap - an Ethscription name',
  '/resolve/ckwf.cb.id - Coinbase off-chain ENS name',
  '/resolve/gregskril.com - an off-chain ENS name',
  '/resolve/mfers.base.eth - an on-chain ENS name',
  '/resolve/tunnckocore.eth - on-chain ENS name',
  '/resolve/wgw?creator=true - find the creator of this Ethscription Name (hirsh)',
  '/resolve/wgw - defaults to resolving current owner',
  '/resolve/dubie.eth',
  '/resolve/jesse.base.eth',
  '',
  '',
  'User profiles and details about them like created & owned ethscriptions, and Ethscription profile state',
  '',
  "/profiles/:name -  State of user's ethscriptions profile: banner, bio, avatar, changes history, etc",
  '/profiles/:name/created - Ethscriptions created by this address, Ethscription Name or ENS name',
  '/profiles/:name/owned - Currently owned by this user',
  '/profiles/wgw',
  '/profiles/wgw/created',
  '/profiles/wgw/owned',
  '',
  '',
  'List ethscriptpions with support for filters',
  '',
  '/ethscriptions - feed of all ethscriptions, including blobscriptions, supports filters',
  '/ethscriptions?filter=params - all filters from the official API are supported, also can use ENS or Eths Names',
  '/ethscriptions?reverse=true - get from first to latest ethscriptions',
  '',
  'Can use comma-separated fields to include specific fields from the upstream API, like `content_uri`',
  '/ethscriptions?with=current_owner,content_uri - `current_owner` is not existent in regular response, so it comes from upstream',
  '/ethscriptions?only=transaction_hash,creator,content_uri&with=content_uri - results in response to include only these fields',
  '',
  'Filters examples, for user created and owned, better use the /profiles/:name endpoints',
  '',
  '/ethscriptions?creator=0xAddress - filter by creator address',
  "/ethscriptions?creator=wgw - since there is no `resolve` param, it won't find wgw's ethscriptions",
  '/ethscriptions?creator=wgw&resolve=1 - filter by creator, using current owner of this Ethscription Name',
  '/ethscriptions?creator=ckwf.cb.id&resolve=1 - filter by creator using Coinbase Off-chain ENS',
  '/ethscriptions?creator=dubie.eth&resolve=1 - filter by creator using On-Chain ENS',
  '/ethscriptions?initial_owner=wgw.lol&resolve=1 - filter by initial owner, using current owner of an Ethscription name',
  '/ethscriptions?initial_owner=5848.tree&resolve=1 - filter by initial owner, using current owner of this Ethscription Name',
  '/ethscriptions?creator=123.ethmap&resolve=1 - filter by creator, current holder/owner of this Ethscription',
  '/ethscriptions?current_owner=barry.wgw.lol&resolve=1 - filter by current owner of this off-chain ENS name',
  '/ethscriptions?owner=e5b5&resolve=1 - filter by current owner',
  '',
  '',
  'Blobscriptions',
  '',
  '/blobscriptions - filter only Blobscriptions',
  '/blobscriptions?reverse=true - from first Blobscription to latest',
  '',
  '',
  'Get Ethscription details by ":id", eg. transaction hash or ethscription number',
  '',
  '/ethscriptions/:id - where `:id` can be ethscription number or transaction hash',
  '/ethscriptions/:id/transfers',
  '',
  '/ethscriptions/:id/content',
  '/ethscriptions/:id/data - alias of above',
  '',
  '/ethscriptions/:id/metadata - alias of /ethscriptions/:id',
  '/ethscriptions/:id/meta - alias of above',
  '/ethscriptions/:id/meta?with=content_uri - include the content_uri in the response',
  '',
  '/ethscriptions/:id/attachment',
  '/ethscriptions/:id/blob - alias of above',
  '',
  '/ethscriptions/:id/number',
  '/ethscriptions/:id/index - alias of above',
  '',
  '/ethscriptions/:id/owner',
  '/ethscriptions/:id/owners',
  '/ethscriptions/:id/creator - alias of above',
  '/ethscriptions/:id/receiver - alias of above',
  '/ethscriptions/:id/current - alias of above',
  '/ethscriptions/:id/initial_owner - alias of above',
  '/ethscriptions/:id/previous_owner - alias of above',
  '/ethscriptions/:id/current_owner - alias of above',
  '',
  '',
];
