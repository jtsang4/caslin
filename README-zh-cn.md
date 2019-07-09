# Caslin

一个用于支持"多环境、多角色、多场景"的应用特性管理 JS 框架

> 本框架基于 [Casl](https://github.com/stalniy/casl) 改造，并结合实际需求（多环境管理）而产生灵感。用于在多环境下管理系统的特性和能力，可根据环境、角色的不同对系统特性进行裁剪和接合。
>
> **在此特别感谢 [Casl](https://github.com/stalniy/casl)，没有 Casl 就没有现在的 Caslin。**

[English](https://github.com/wtzeng1/caslin) | 中文

## 框架特点

* 满足一个应用，多个环境的特性定制
* 集中式特性管理，便于查看、定义、更改特性
* 特性定义满足功能、角色、环境自由组合
* 特性定义与特性实现解耦，可灵活变更特性定义或者特性实现
* 基于 Casl 改造，底层 API 逻辑简单清晰，同时提供友好、易用的 React 上层封装 API

## 与 Casl 的不同点

* 源码使用 TypeScript
* 引入环境的概念，以解决 Casl 未强调解决的"相同功能，不同环境"的问题
* 增加环境相关 API 以及 [React 高阶组件](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-react/README-zh-cn.md)

## 安装

```shell
npm install @caslin/feature --save
```

## 基本使用

原则：每一条特性规则对应一句基本语义：**At &lt;environment> can &lt;do> &lt;something>**.

### 1. 定义特性

通过定义多条规则，生成 feature 对象。

```javascript
import { FeatureBuilder } from '@caslin/feature';

const feature = FeatureBuilder.define((can, cannot, at) => {
  at('all').can('read', 'Article');
  at('featEnv1').can('create', 'Article');
  at('featEnv2').cannot('delete', 'Article');
  can('read', 'Comment'); // Alias of `at('all').can('read', 'Comment');`
});
```

### 2. 检查能力

利用 feature 对象检查是否拥有相应特性。

```javascript
feature.at('featEnv1').can('create', 'Article'); // true
feature.at('featEnv2').cannot('delete', 'Article'); // true
feature.at('featEnv1').cannot('delete', 'Article'); // true
feature.at('featEnv2').cannot(['delete', 'create'], 'Article'); // true
feature.at('featEnv2').can('read', 'Article'); // true, because "all" env could "read"
feature.can('read', 'Comment'); // true. Alias of `feature.at('all').can('read', 'Comment');`
```

### 3. 设置默认环境，检查环境（可选）

配置当前的默认环境，并可检查传入的环境是否匹配默认环境。

```javascript
feature.setEnv('featEnv1'); // set current environment as "featEnv1"，could be reset by `feature.resetEnv()`

// Check feature
feature.can('read', 'Article'); // true, same as `feature.at('featEnv1').can('read', 'Article')`
feature.can('manage', 'Article'); // true
feature.cannot('delete', 'Article'); // true

// Check environment
feature.env.is('featEnv1'); // true，current environment is "featEnv1"
feature.env.not('featEnv2'); // true，current environment is not "featEnv2"
feature.env.in(['featEnv2', 'featEnv3']); // false，current environment isn't been included
feature.env.notIn(['featEnv2', 'featEnv3']); // true，current environment isn't been included
```

## API

更加详细的 API 请见 [API 文档](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-feature/README-zh-cn.md)

### FeatureBuilder

* FeatureBuilder.define(definer: Definer)

接收一个 `Definer` 类型的参数，生成 feature 对象。类型为 `{ (definer: Definer): Feature }`。

### Definer

定义规则的函数，类型为 `{ (can, cannot, at): Promise<any> | void }`，定义一条规则的基本用法为 `at('environment').can('read', 'Article')`。

可以省略 `at()`，表示本条规则适用所有环境，如 `can('read', 'Article')`，等效于 `at('all').can('read', 'Article')`。

### Feature

假定有一个 `feature` 为 `Feature` 的实例。

* feature.at('env').can('action', 'subject')

表示在某环境(env)下对某主体(subject)是否有操作(action/actions)的能力，**有**则返回 `true`，否则返回 `false`。

* feature.at('env').cannot('action', 'subject')

表示在某环境(env)下对某主体(subject)是否有操作(action/actions)的能力，**没有**则返回 `true`，否则返回 `false`。

* feature.setEnv('env')

设置当前的默认环境。

* feature.resetEnv()

取消设置当前的默认环境。

* feature.env.is('env')

检验当前的默认环境是否是 "env"，如果**是**则返回 `true`，否则返回 `false`。

* feature.env.not('env')

检验当前的默认环境是否是 "env"，如果**不是**则返回 `true`，否则返回 `false`。

* feature.env.in(['env1', 'env2'])

检验当前的默认环境是否包含于 env1, env2 中，如果**包含**则返回 `true`，否则返回 `false`。

* feature.env.notIn(['env1', 'env2'])

检验当前的默认环境是否是包含于 env1, env2 中，如果**不包含**则返回 `true`，否则返回 `false`。

## 许可协议

[MIT License](https://github.com/wtzeng1/caslin/blob/master/LICENSE)
