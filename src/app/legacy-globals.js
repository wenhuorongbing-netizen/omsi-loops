"use strict";

(function setupLegacyBindings(global) {
    function resolveBinding(name, getter) {
        try {
            const value = getter();
            if (value != null) {
                return value;
            }
        } catch {
            // Fall back to global properties for var-backed legacy globals.
        }
        return global[name];
    }

    function createBindingAccessor(name, getter, setter) {
        return Object.freeze({
            get() {
                return resolveBinding(name, getter);
            },
            set(value) {
                if (typeof setter !== "function") {
                    throw new Error(`[legacy-globals] Binding "${name}" is read-only`);
                }
                setter(value);
                return resolveBinding(name, getter);
            },
        });
    }

    global.IdleLoopsLegacy = Object.freeze({
        createBindingAccessor,
        resolveBinding,
    });
})(globalThis);
