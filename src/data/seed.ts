import type { AppData, Ingredient, MealPlan, Recipe, TakeoutOption } from '../types'

export const pantryNames = ['油', '盐', '生抽', '醋', '白糖']
export const defaultTakeoutCategories = ['米饭', '面食', '快餐', '小吃', '清淡', '其他']

export const seedIngredients: Ingredient[] = [
  ['chicken-leg','鸡腿','肉蛋','🍗'],['chicken-breast','鸡胸肉','肉蛋','🐔'],['pork','猪肉','肉蛋','🥩'],['beef','牛肉','肉蛋','🥩'],['egg','鸡蛋','肉蛋','🥚'],['shrimp','虾','肉蛋','🦐'],
  ['tomato','西红柿','蔬菜','🍅'],['potato','土豆','蔬菜','🥔'],['greens','青菜','蔬菜','🥬'],['carrot','胡萝卜','蔬菜','🥕'],['mushroom','香菇','蔬菜','🍄'],
  ['rice','米饭','主食','🍚'],['noodle','面条','主食','🍜'],['wonton','馄饨','主食','🥟'],['tofu','豆腐','豆制品','◻️'],
  ['ginger','生姜','其他','🫚'],['scallion','小葱','其他','🌿'],['garlic','大蒜','其他','🧄']
].map(([id,name,category,emoji]) => ({ id, name, category: category as Ingredient['category'], emoji, enabled: true }))

const p = (ingredientId: string, amount: number, unit: string) => ({ ingredientId, amount, unit })

export const seedRecipes: Recipe[] = [
  { id:'potato-chicken', name:'土豆烧鸡', description:'咸香下饭，一锅就能完成。', required:[p('chicken-leg',3,'只'),p('potato',2,'个')], optional:[p('carrot',1,'根')], substitutions:[{ingredientId:'chicken-leg',alternatives:['鸡胸肉']}], pantry:[p('ginger',1,'份'),p('scallion',1,'份')], steps:['鸡腿切块焯水，土豆切块。','锅中少油煸香姜片，放鸡腿炒至微黄。','加入土豆、生抽和清水，小火焖 20 分钟。','收汁后撒小葱即可。'], minutes:35, difficulty:'简单', tags:['少洗锅','一锅完成'], color:'#f2a55d' },
  { id:'tomato-egg-soup', name:'西红柿蛋汤', description:'酸甜清爽，十多分钟就能上桌。', required:[p('tomato',2,'个'),p('egg',2,'个')], optional:[p('tofu',0.5,'盒')], substitutions:[], pantry:[p('scallion',1,'份')], steps:['西红柿切块，鸡蛋打散。','西红柿炒软后加水煮开。','淋入蛋液，调味后撒葱花。'], minutes:15, difficulty:'简单', tags:['省时间','清淡','少洗锅'], color:'#f17b4f' },
  { id:'pan-chicken', name:'香煎鸡腿', description:'外焦里嫩，配青菜很合适。', required:[p('chicken-leg',2,'只')], optional:[p('greens',1,'把')], substitutions:[{ingredientId:'chicken-leg',alternatives:['鸡胸肉']}], pantry:[p('garlic',1,'份')], steps:['鸡腿去骨，用生抽腌 10 分钟。','鸡皮朝下小火煎至金黄。','翻面煎熟，静置后切块。'], minutes:25, difficulty:'简单', tags:['省时间'], color:'#d98a4b' },
  { id:'tomato-potato-soup', name:'番茄土豆汤', description:'温和开胃，蔬菜组合也很饱腹。', required:[p('tomato',2,'个'),p('potato',1,'个')], optional:[p('egg',1,'个')], substitutions:[], pantry:[p('scallion',1,'份')], steps:['番茄和土豆切块。','番茄炒出汁后加土豆和水。','煮至土豆软烂，调味即可。'], minutes:25, difficulty:'简单', tags:['清淡','一锅完成','少洗锅'], color:'#e99458' },
  { id:'beef-noodle', name:'番茄牛肉面', description:'汤浓面滑，一碗就是完整晚餐。', required:[p('beef',250,'克'),p('tomato',2,'个'),p('noodle',2,'份')], optional:[p('greens',1,'把')], substitutions:[], pantry:[p('ginger',1,'份'),p('scallion',1,'份')], steps:['牛肉切片腌制，番茄切块。','番茄炒出汁后加水煮开。','下牛肉、面条和青菜煮熟。'], minutes:30, difficulty:'中等', tags:['一锅完成','少洗锅'], color:'#ce7352' },
  { id:'tofu-greens', name:'青菜豆腐汤', description:'清淡舒服，晚一点吃也没负担。', required:[p('tofu',1,'盒'),p('greens',1,'把')], optional:[p('mushroom',4,'朵')], substitutions:[], pantry:[p('ginger',1,'份')], steps:['豆腐切块，青菜洗净。','水开后下豆腐和香菇。','最后放青菜，调味煮 2 分钟。'], minutes:15, difficulty:'简单', tags:['省时间','清淡','一锅完成'], color:'#90a96d' },
  { id:'shrimp-egg', name:'虾仁滑蛋', description:'鲜嫩快速，适合配米饭。', required:[p('shrimp',250,'克'),p('egg',3,'个')], optional:[p('scallion',1,'份')], substitutions:[], pantry:[], steps:['虾去壳去虾线，鸡蛋打散。','虾仁炒至变色。','倒入蛋液，小火推至凝固。'], minutes:18, difficulty:'简单', tags:['省时间','少洗锅'], color:'#e9a47b' },
  { id:'pork-mushroom-rice', name:'香菇肉焖饭', description:'饭菜同锅，收拾起来很轻松。', required:[p('pork',250,'克'),p('mushroom',6,'朵'),p('rice',2,'杯')], optional:[p('carrot',1,'根')], substitutions:[], pantry:[p('ginger',1,'份')], steps:['香菇和猪肉切丁炒香。','与淘好的米一起放入电饭锅。','加正常水量，启动煮饭程序。'], minutes:45, difficulty:'简单', tags:['一锅完成','少洗锅'], color:'#a9825d' }
]

export const seedMealPlans: MealPlan[] = [
  {id:'plan-1',name:'土豆烧鸡 + 西红柿蛋汤',recipeIds:['potato-chicken','tomato-egg-soup'],reason:'荤素和汤都有，已选食材利用率高。',tags:['少洗锅']},
  {id:'plan-2',name:'香煎鸡腿 + 番茄土豆汤',recipeIds:['pan-chicken','tomato-potato-soup'],reason:'两道菜可以交错进行，半小时左右开饭。',tags:['省时间']},
  {id:'plan-3',name:'番茄牛肉面',recipeIds:['beef-noodle'],reason:'主食和菜一锅完成，适合不想洗太多锅。',tags:['一锅完成','少洗锅']},
  {id:'plan-4',name:'青菜豆腐汤 + 虾仁滑蛋',recipeIds:['tofu-greens','shrimp-egg'],reason:'口味清爽，蛋白质也很充足。',tags:['清淡','省时间']},
  {id:'plan-5',name:'香菇肉焖饭',recipeIds:['pork-mushroom-rice'],reason:'交给电饭锅，备菜后可以轻松休息。',tags:['一锅完成','少洗锅']}
]

export const seedTakeouts: TakeoutOption[] = [
  ['t1','照烧鸡腿饭','米饭',28,35,'#e8a35d'],['t2','番茄牛腩饭','米饭',34,40,'#d97755'],['t3','红烧牛肉面','面食',30,32,'#c97a4c'],['t4','鲜虾云吞面','面食',26,30,'#dc9a6f'],['t5','汉堡套餐','快餐',32,25,'#e1a255'],['t6','生煎小笼','小吃',24,28,'#d7a978'],['t7','菌菇鸡汤','清淡',29,38,'#87a66d'],['t8','杂粮轻食碗','清淡',31,25,'#799f70'],['t9','麻辣烫','其他',27,35,'#d85e3f']
].map(([id,name,category,price,minutes,color]) => ({id:String(id),name:String(name),category:category as TakeoutOption['category'],price:Number(price),minutes:Number(minutes),color:String(color)}))

export const seedData: AppData = { version:1, ingredients:seedIngredients, recipes:seedRecipes, mealPlans:seedMealPlans, takeouts:seedTakeouts, history:[], preferences:[], shopping:[], settings:{groceryUrl:'',takeoutCategories:defaultTakeoutCategories} }
