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

const ModelUtil = require('./modelutil');
const RESOURCE_SCHEME = 'resource';

/**
 * Tests whether an object is a valid Concerto object
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @throw {Error} an error if the object does not have a $class attribute
 * @return {*} the ClassDeclaration for the type
 */
function checkConcertoObject(obj, modelManager) {
    if(!obj.$class) {
        throw new Error('Input object does not have a $class attribute.');
    }

    const typeDeclaration = modelManager.getType(obj.$class);

    if(!typeDeclaration) {
        throw new Error(`Type ${obj.$class} is not declared in the model manager`);
    }

    return typeDeclaration;
}

/**
 * Gets the identifier for an object
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @return {string} The identifier for this object
 */
function getIdentifier(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    const typeDeclaration = modelManager.getType(obj.$class);
    const idField = typeDeclaration.getIdentifierFieldName();
    if(!idField) {
        throw new Error('Object is not identifiable.');
    }
    return obj[idField];
}

/**
 * Returns true if the object has an identifier
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @return {boolean} is the object has been defined with an identifier in the model
 */
function isIdentifiable(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    const typeDeclaration = modelManager.getType(obj.$class);
    const idField = typeDeclaration.getIdentifierFieldName();
    return idField !== null;
}

/**
 * Returns true if the object is a relationship
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @return {boolean} true if the object is a relationship
 */
function isRelationship(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    return obj.$relationship === true;
}

/**
 * Set the identifier for an object
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @param {string} id the new identifier
 */
function setIdentifier(obj, modelManager, id ) {
    checkConcertoObject(obj, modelManager);
    const typeDeclaration = modelManager.getType(obj.$class);
    const idField = typeDeclaration.getIdentifierFieldName();
    obj[idField] = id;
}

/**
 * Returns the fully qualified identifier for an object
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @returns {string} the fully qualified identifier
 */
function getFullyQualifiedIdentifier(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    return `${obj.$class}#${getIdentifier(obj, modelManager)}`;
}

/**
 * Returns a URI for an object
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @return {string} the URI for the object
 */
function toURI(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    return `${RESOURCE_SCHEME}:${obj.$class}#${encodeURI(getIdentifier(obj, modelManager))}`;
}

/**
 * Returns the short type name
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @returns {string} the short type name
 */
function getType(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    return ModelUtil.getShortName(obj.$class);
}

/**
 * Returns the namespace for the object
 * @param {*} obj the input object
 * @param {*} modelManager the model manager
 * @returns {string} the namespace
 */
function getNamespace(obj, modelManager) {
    checkConcertoObject(obj, modelManager);
    return ModelUtil.getNamespace(obj.$class);
}

/**
     * Check to see if this instance is an instance of the specified fully qualified
     * type name.
     * @param {*} obj the input object
     * @param {*} modelManager the model manager
     * @param {String} fqt The fully qualified type name.
     * @returns {boolean} True if this instance is an instance of the specified fully
     * qualified type name, false otherwise.
     */
function instanceOf(obj, modelManager, fqt) {
    // Check to see if this is an exact instance of the specified type.
    const classDeclaration = checkConcertoObject(obj, modelManager);
    if (classDeclaration.getFullyQualifiedName() === fqt) {
        return true;
    }
    // Now walk the class hierachy looking to see if it's an instance of the specified type.
    let superTypeDeclaration = classDeclaration.getSuperTypeDeclaration();
    while (superTypeDeclaration) {
        if (superTypeDeclaration.getFullyQualifiedName() === fqt) {
            return true;
        }
        superTypeDeclaration = superTypeDeclaration.getSuperTypeDeclaration();
    }
    return false;
}

module.exports.checkConcertoObject = checkConcertoObject;
module.exports.getIdentifier = getIdentifier;
module.exports.setIdentifier = setIdentifier;
module.exports.getFullyQualifiedIdentifier = getFullyQualifiedIdentifier;
module.exports.toURI = toURI;
module.exports.getType = getType;
module.exports.getNamespace = getNamespace;
module.exports.instanceOf = instanceOf;
module.exports.isIdentifiable = isIdentifiable;
module.exports.isRelationship = isRelationship;
