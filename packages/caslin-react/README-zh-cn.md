# Caslin React

一个让在 React 中使用 Caslin 更加简单的工具库

[English](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-react) | 中文

## 安装

```shell
npm install @caslin/feature @caslin/react --save
```

## 基本使用

假定已经存在一个 `feature.js` 文件，它暴露了利用 [FeatureBuilder.define()](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-feature/README-zh-cn.md#featurebuilder) 生成的 feature 对象。

### 1. &lt;Can> 组件

组件的属性名与 [@caslin/feature](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-feature/README-zh-cn.md#feature) 中的相同，当特性检验结果为 true 时，将根据 `<Can>` 组件的 children 视情况进行渲染。

```jsx
import { Can } from '@caslin/react';
import feature from './feature';

// 'chidlren' as render function
<Can env="featEnv1" action="create" subject="Article" feature={feature}>
  {() => <button onClick={this.createArticle.bind(this)}>Create Article</button>}
</Can>

// not
<Can not env="featEnv1" action="create" subject="Article" feature={feature}>
  {() => <button onClick={this.createArticle.bind(this)}>Create Article</button>}
</Can>

// passThrough, pass match result as parameter
<Can passThrough env="featEnv1" action="create" subject="Article" feature={feature}>
  {(match) => <button disabled={match} onClick={this.createArticle.bind(this)}>Create Article</button>}
</Can>

// 'children' element
<Can env="featEnv1" action="create" subject="Article" feature={feature}>
  <button onClick={this.createArticle.bind(this)}>Create Article</button>
</Can>
```

### 2. &lt;Env> 组件

一般使用这个组件的时候已经提取调用 [feat.setEnv()](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-feature/README-zh-cn.md#feature) 设置好了当前的默认环境。

```jsx
import { Env } from '@caslin/react';
import feature from './feature';

<Env is="featEnv1" feature={feature}>
  {() => <div>feature env 1</div>}
</Env>

<Env not="featEnv1" feature={feature}>
  {() => <div>feature env 2</div>}
</Env>

<Env in={['featEnv1', 'featEnv2']} feature={feature}>
  {() => <div>feature env 1</div>}
</Env>

<Env notIn={['featEnv2', 'featEnv3']} feature={feature}>
  {() => <div>feature env 1</div>}
</Env>

// passThrough, pass match result as parameter
<Env passThrough is="featEnv1" feature={feature}>
  {(match) => <div>{match ? 'is' : 'not'} env 1</div>}
</Env>
```

### 3. 使用定义好的 feature，避免每次都需要传递

#### createCheckerBoundTo()

传递 `feature` 作为 `createCheckerBoundTo()` 的参数得到高阶组件。

```jsx
// featChecker.js
import { createCheckerBoundTo } from '@caslin/react';
import feature from './feature';

export default createCheckerBoundTo(feature); // { Can, Env }
```

之后就可以直接使用预定义好了 `feature` 的 `<Can>` 和 `<Env>`，而不用再次传递了：

```jsx
import featUtil from './featChecker';
const { Can, Env } = featUtil;

<Can action="create" subject="Article">
  {() => <button onClick={this.createArticle.bind(this)}>Create Article</button>}
</Can>

<Env is="featEnv1">
  {() => <div>feature env 1</div>}
</Env>
```

#### createContextualChecker()

传递 `Context.Consumer` 作为 `createContextualChecker()` 的参数得到高阶组件。

```jsx
// featChecker.js
import React from 'react';
import { createContextualChecker } from '@caslin/react';
import feature from './feature';

export const FeatContext = React.createContext(feature);

export default createContextualChecker(FeatContext.Consumer); // { Can, Env }
```

```jsx
// High hierarchy component
import feature from './feature';
import { FeatContext } from './featChecker';

...
<FeatContext.Provider value={feature}>
  {// ...chidlren}
</FeatContext.Provider>
...
```

```jsx
// Use HOC
import featUtil from './featChecker';
const { Can, Env } = featUtil;

<Can action="create" subject="Article">
  {() => <button onClick={this.createArticle.bind(this)}>Create Article</button>}
</Can>

<Env is="featEnv1">
  {() => <div>feature env 1</div>}
</Env>
```

## 许可协议

[MIT License](https://github.com/wtzeng1/caslin/blob/master/LICENSE)
