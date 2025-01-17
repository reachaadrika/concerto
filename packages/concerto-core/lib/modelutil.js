/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const { MetaModelUtil } = require('@accordproject/concerto-metamodel');
const semver = require('semver');
const Globalize = require('./globalize');

/**
 * Internal Model Utility Class
 * <p><a href="./diagrams-private/modelutil.svg"><img src="./diagrams-private/modelutil.svg" style="height:100%;"/></a></p>
 * @private
 * @class
 * @memberof module:concerto-core
 */
class ModelUtil {
    /**
     * Returns everything after the last dot, if present, of the source string
     * @param {string} fqn - the source string
     * @return {string} - the string after the last dot
     */
    static getShortName(fqn) {
        //console.log('toShortName ' + name );
        let result = fqn;
        let dotIndex = fqn.lastIndexOf('.');
        if (dotIndex > -1) {
            result = fqn.substr(dotIndex + 1);
        }

        //console.log('result ' + result );
        return result;
    }

    /**
     * Returns the namespace for the fully qualified name of a type
     * @param {string} fqn - the fully qualified identifier of a type
     * @return {string} - namespace of the type (everything before the last dot)
     * or the empty string if there is no dot
     */
    static getNamespace(fqn) {
        if (!fqn) {
            throw new Error(Globalize.formatMessage('modelutil-getnamespace-nofnq'));
        }

        let result = '';
        let dotIndex = fqn.lastIndexOf('.');
        if (dotIndex > -1) {
            result = fqn.substr(0, dotIndex);
        }

        return result;
    }

    /**
     * @typedef ParseNamespaceResult
     * @property {string} name the name of the namespace
     * @property {string} escapedNamespace the escaped namespace
     * @property {string} version the version of the namespace
     * @property {object} versionParsed the parsed semantic version of the namespace
     */

    /**
     * Parses a potentially versioned namespace into
     * its name and version parts. The version of the namespace
     * (if present) is parsed using semver.parse.
     * @param {string} ns the namespace to parse
     * @returns {ParseNamespaceResult} the result of parsing
     */
    static parseNamespace(ns) {
        if(!ns) {
            throw new Error('Namespace is null or undefined.');
        }

        const parts = ns.split('@');
        if(parts.length > 2) {
            throw new Error(`Invalid namespace ${ns}`);
        }

        if(parts.length === 2) {
            if(!semver.valid(parts[1])) {
                throw new Error(`Invalid namespace ${ns}`);
            }
        }

        return {
            name: parts[0],
            escapedNamespace: ns.replace('@', '_'),
            version: parts.length > 1 ? parts[1] : null,
            versionParsed: parts.length > 1 ? semver.parse(parts[1]) : null
        };
    }

    /**
     * Return the fully qualified name for an import
     * @param {object} imp - the import
     * @return {string[]} - the fully qualified names for that import
     * @private
     */
    static importFullyQualifiedNames(imp) {
        return MetaModelUtil.importFullyQualifiedNames(imp);
    }

    /**
     * Returns true if the type is a primitive type
     * @param {string} typeName - the name of the type
     * @return {boolean} - true if the type is a primitive
     * @private
     */
    static isPrimitiveType(typeName) {
        const primitiveTypes = ['Boolean', 'String', 'DateTime', 'Double', 'Integer', 'Long'];
        return (primitiveTypes.indexOf(typeName) >= 0);
    }

    /**
     * Returns true if the type is assignable to the propertyType.
     *
     * @param {ModelFile} modelFile - the ModelFile that owns the Property
     * @param {string} typeName - the FQN of the type we are trying to assign
     * @param {Property} property - the property that we'd like to store the
     * type in.
     * @return {boolean} - true if the type can be assigned to the property
     * @private
     */
    static isAssignableTo(modelFile, typeName, property) {
        const propertyTypeName = property.getFullyQualifiedTypeName();

        const isDirectMatch = (typeName === propertyTypeName);
        if (isDirectMatch || ModelUtil.isPrimitiveType(typeName) || ModelUtil.isPrimitiveType(propertyTypeName)) {
            return isDirectMatch;
        }

        const typeDeclaration = modelFile.getType(typeName);
        if (!typeDeclaration) {
            throw new Error('Cannot find type ' + typeName);
        }

        return typeDeclaration.getAllSuperTypeDeclarations().
            some(type => type.getFullyQualifiedName() === propertyTypeName);
    }

    /**
     * Returns the passed string with the first character capitalized
     * @param {string} string - the string
     * @return {string} the string with the first letter capitalized
     * @private
     */
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Returns the true if the given field is an enumerated type
     * @param {Field} field - the string
     * @return {boolean} true if the field is declared as an enumeration
     * @private
     */
    static isEnum(field) {
        const modelFile = field.getParent().getModelFile();
        const typeDeclaration = modelFile.getType(field.getType());
        return (typeDeclaration !== null && typeDeclaration.isEnum());
    }

    /**
     * Get the fully qualified name of a type.
     * @param {string} namespace - namespace of the type.
     * @param {string} type - short name of the type.
     * @returns {string} the fully qualified type name.
     */
    static getFullyQualifiedName(namespace, type) {
        if (namespace) {
            return `${namespace}.${type}`;
        } else {
            return type;
        }
    }
}

module.exports = ModelUtil;
