'use strict';
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create song with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.songs.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.songs.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.songs });
  },
  // Update user song
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [songs] = await strapi.services.songs.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!songs) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.songs.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.songs.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.songs });
  },
  // Delete a user song
  async delete(ctx) {
    const { id } = ctx.params;

    const [songs] = await strapi.services.songs.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!songs) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.songs.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.songs });
  },
  // Get logged in users
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.songs.find({ user: user.id });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.songs });
  },
};
