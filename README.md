# Caslin

An application feature management JS framework to support multi-environments, multi-roles, multi-scenarios

> This framework is transformed from [Casl](https://github.com/stalniy/casl) and is motivated by the actual needs (multi-environments feature management). It is used to manage the features and abilities of your application in multiple environments. The application features can be tailored and joined according to the environments and roles.
>
> **Special thanks to [Casl](https://github.com/stalniy/casl), without Casl there is no current Caslin.**

English | [中文](https://github.com/wtzeng1/caslin/blob/master/README-zh-cn.md)

## Features of Caslin

* Able to customize features in multiple environments
* Centralized feature management for easy viewing, definition, and changes
* Feature definition meets the free combination of functions, roles, and environments
* Feature definition and feature implementation decoupling, flexible change of feature definition or feature implementation
* Transformed from Casl, the underlying API logic is simple and clear, while providing a friendly, easy-to-use React utility

## Difference between Casl

* Source code written by TypeScript
* Introduce the concept of the "environment" to solve the problem of "same function, different environment" that Casl does not focus
* Add environment-related APIs and [React HOC components](https://github.com/wtzeng1/caslin/tree/master/packages/caslin-react)

## Installation

```shell
npm install @caslin/feature --save
```

## Getting start

Principle: Each feature rule corresponds to a basic semantic：**At &lt;environment> can &lt;do> &lt;something>**.

### 1. Definite feature

Generate a feature instance by defining multiple rules.

```javascript
import { FeatureBuilder } from '@caslin/feature';

const feature = FeatureBuilder.define((can, cannot, at) => {
  at('all').can('read', 'Article');
  at('featEnv1').can('create', 'Article');
  at('featEnv2').cannot('delete', 'Article');
  can('read', 'Comment'); // Alias of `at('all').can('read', 'Comment');`
});
```

### 2. Check ability

Use the feature instance to check if you have the corresponding ability.

```javascript
feature.at('featEnv1').can('create', 'Article'); // true
feature.at('featEnv2').cannot('delete', 'Article'); // true
feature.at('featEnv1').cannot('delete', 'Article'); // true
feature.at('featEnv2').cannot(['delete', 'create'], 'Article'); // true
feature.at('featEnv2').can('read', 'Article'); // true, because "all" env could "read"
feature.can('read', 'Comment'); // true. Alias of `feature.at('all').can('read', 'Comment');`
```

### 3. Set the default environment, then check the environment (optional)

Set the current default environment and check if the passed environment matches the default environment.

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

For more details and APIs: [API DOC](https://github.com/wtzeng1/caslin/blob/master/packages/caslin-feature)

### FeatureBuilder

* FeatureBuilder.define(definer: Definer)

Receive a parameter of type `Definer` to generate a feature instance. The type is `{ (definer: Definer): Feature }`.

### Definer

The function that defines the rule, of type `{ (can, cannot, at): Promise<any> | void }`, the basic usage of defining a rule is `at('environment').can('read', 'Article' )`.

You can omit `at()` to indicate that this rule applies to all environments, such as `can('read', 'Article')`, which is equivalent to `at('all').can('read', 'Article') `.

### Feature

Suppose there is already a `feature` for the instance of `Feature`.

* feature.at('env').can('action', 'subject')

Check if it is **able** to do action/actions on a subject at arbitrary environment, returns `true` if yes, otherwise returns `false`.

* feature.at('env').cannot('action', 'subject')

Check if it is **unable** to do action/actions on a subject at arbitrary environment, returns `true` if yes, otherwise returns `false`.

* feature.setEnv('env')

Set the current default environment.

* feature.resetEnv()

Reset the current default environment.

* feature.env.value

The value of current default environment.

* feature.env.is('env')

Check that the current default environment is "env", return `true` if it **is**, or `false` otherwise.

* feature.env.not('env')

Check that the current default environment is "env", return `true` if it **isn't**, or `false` otherwise.

* feature.env.in(['env1', 'env2'])

Check that the current default environment is included in env1, env2 and return `true` if **it contains**, otherwise return `false`.

* feature.env.notIn(['env1', 'env2'])

Verify that the current default environment is included in env1, env2 and return `true` if **it is not**, otherwise return `false`.

* feature.env.matchPick({ env1: 'value1', env2: 'value2' })

Pick the key-value pair whose key matches current environment, return the value of mathced key-value pair.

## UI integration

Just like Casl, Caslin is also a pure JS library with no external dependencies, and can be used in both Node and browser environments. In order to be better used in different environments, there are some environment-related integrated tool libraries available.

* [@caslin/react](https://github.com/wtzeng1/caslin/tree/master/packages/caslin-react) for [React](https://reactjs.org/)

## License

[MIT License](https://github.com/wtzeng1/caslin/blob/master/LICENSE)
